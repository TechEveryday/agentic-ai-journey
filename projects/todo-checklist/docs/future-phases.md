# Future Phases

This document outlines how Phase 2 (Backend API) and Phase 3 (Multi-User Auth) are designed, with emphasis on **zero refactoring** of Phase 1 code.

## Phase 2: React + C# .NET 8 API + Postgres

### Overview

Add a C# backend with RESTful API and PostgreSQL database. The React frontend remains almost unchanged — single-line swap of repository.

### Frontend Changes

#### 1. New File: `src/infrastructure/HttpTodoRepository.ts`

```typescript
import type { Todo } from '@/core';
import type { ITodoRepository } from '@/application';

export class HttpTodoRepository implements ITodoRepository {
  constructor(private baseUrl: string) {}

  async getAll(): Promise<Todo[]> {
    const response = await fetch(`${this.baseUrl}/api/todos`);
    if (!response.ok) throw new Error(`Failed to fetch todos: ${response.statusText}`);
    return response.json();
  }

  async getById(id: string): Promise<Todo | null> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Failed to fetch todo: ${response.statusText}`);
    return response.json();
  }

  async save(todo: Todo): Promise<void> {
    const isNew = !localStorage.getItem(`todo-${todo.id}`);
    const method = isNew ? 'POST' : 'PUT';
    const endpoint = isNew ? `${this.baseUrl}/api/todos` : `${this.baseUrl}/api/todos/${todo.id}`;

    const response = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todo),
    });

    if (!response.ok) throw new Error(`Failed to save todo: ${response.statusText}`);
  }

  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error(`Failed to delete todo: ${response.statusText}`);
  }
}
```

#### 2. Update: `src/presentation/pages/TodoPage.tsx`

**Before (Phase 1)**:
```typescript
const repository = new LocalStorageTodoRepository();
```

**After (Phase 2)**:
```typescript
const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
const repository = new HttpTodoRepository(apiUrl);
```

#### 3. Update: `.env.example`

```
# Phase 2: Backend API
VITE_API_BASE_URL=http://localhost:5000
```

#### 4. No Changes Required
- `src/core/` — Validators unchanged
- `src/application/` — Hook unchanged
- `src/presentation/` — Components unchanged
- Tests — Integration tests still work with `MockTodoRepository`

### Backend: C# .NET 8 Project Structure

```
backend/
├── TodoChecklist.Api/
│   ├── Program.cs
│   ├── Controllers/
│   │   └── TodosController.cs
│   ├── Middleware/
│   │   └── ErrorHandlingMiddleware.cs
│   └── TodoChecklist.Api.csproj
│
├── TodoChecklist.Application/
│   ├── Interfaces/
│   │   ├── ITodoService.cs
│   │   └── ITodoRepository.cs
│   ├── Services/
│   │   └── TodoService.cs
│   ├── DTOs/
│   │   └── TodoDto.cs
│   └── TodoChecklist.Application.csproj
│
├── TodoChecklist.Domain/
│   ├── Entities/
│   │   └── Todo.cs
│   ├── ValueObjects/
│   │   └── TodoTitle.cs
│   ├── Enums/
│   │   └── TodoStatus.cs
│   └── TodoChecklist.Domain.csproj
│
├── TodoChecklist.Infrastructure/
│   ├── Persistence/
│   │   ├── AppDbContext.cs
│   │   └── TodoRepository.cs
│   ├── Configuration/
│   │   └── TodoConfiguration.cs
│   └── TodoChecklist.Infrastructure.csproj
│
└── TodoChecklist.sln
```

### Backend: Domain (Mirrors React Core)

```csharp
// TodoChecklist.Domain/Enums/TodoStatus.cs
public enum TodoStatus {
    Incomplete,
    Complete
}

// TodoChecklist.Domain/Entities/Todo.cs
public class Todo {
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public TodoStatus Status { get; set; } = TodoStatus.Incomplete;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// TodoChecklist.Domain/ValueObjects/TodoTitle.cs
public class TodoTitle {
    public string Value { get; private set; }

    public TodoTitle(string value) {
        Validate(value);
        Value = value.Trim();
    }

    private static void Validate(string value) {
        if (string.IsNullOrWhiteSpace(value)) {
            throw new ArgumentException("Title cannot be empty");
        }
        if (value.Trim().Length > 200) {
            throw new ArgumentException("Title must be 200 characters or less");
        }
    }
}
```

**Key Point**: `TodoTitle` value object enforces the same validation rules as `validateTodoTitle()` in the frontend. Validation is not duplicated—it's enforced at the entity level.

### Backend: Application Layer

```csharp
// TodoChecklist.Application/Interfaces/ITodoRepository.cs
public interface ITodoRepository {
    Task<List<Todo>> GetAllAsync();
    Task<Todo?> GetByIdAsync(Guid id);
    Task SaveAsync(Todo todo);
    Task DeleteAsync(Guid id);
}

// TodoChecklist.Application/Services/TodoService.cs
public class TodoService {
    private readonly ITodoRepository _repository;

    public TodoService(ITodoRepository repository) {
        _repository = repository;
    }

    public async Task<TodoDto> AddTodoAsync(string title) {
        var todoTitle = new TodoTitle(title);  // Validates here
        var todo = new Todo {
            Id = Guid.NewGuid(),
            Title = todoTitle.Value,
            Status = TodoStatus.Incomplete,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.SaveAsync(todo);
        return MapToDto(todo);
    }

    public async Task<TodoDto?> GetTodoAsync(Guid id) {
        var todo = await _repository.GetByIdAsync(id);
        return todo == null ? null : MapToDto(todo);
    }

    public async Task UpdateTodoAsync(Guid id, string title) {
        var todo = await _repository.GetByIdAsync(id);
        if (todo == null) throw new KeyNotFoundException($"Todo {id} not found");

        var todoTitle = new TodoTitle(title);
        todo.Title = todoTitle.Value;
        todo.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync(todo);
    }

    public async Task CompleteTodoAsync(Guid id) {
        var todo = await _repository.GetByIdAsync(id);
        if (todo == null) throw new KeyNotFoundException($"Todo {id} not found");

        todo.Status = todo.Status == TodoStatus.Complete 
            ? TodoStatus.Incomplete 
            : TodoStatus.Complete;
        todo.UpdatedAt = DateTime.UtcNow;

        await _repository.SaveAsync(todo);
    }

    public async Task DeleteTodoAsync(Guid id) {
        await _repository.DeleteAsync(id);
    }

    private static TodoDto MapToDto(Todo todo) {
        return new TodoDto {
            Id = todo.Id,
            Title = todo.Title,
            Status = todo.Status.ToString().ToLowerInvariant(),
            CreatedAt = todo.CreatedAt.ToString("O"),
            UpdatedAt = todo.UpdatedAt.ToString("O")
        };
    }
}
```

### Backend: Infrastructure (EF Core + Postgres)

```csharp
// TodoChecklist.Infrastructure/Persistence/AppDbContext.cs
public class AppDbContext : DbContext {
    public DbSet<Todo> Todos { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Todo>(builder => {
            builder.HasKey(t => t.Id);
            builder.Property(t => t.Title)
                .IsRequired()
                .HasMaxLength(200);
            builder.Property(t => t.Status)
                .HasConversion(
                    v => v.ToString(),
                    v => (TodoStatus)Enum.Parse(typeof(TodoStatus), v)
                );
        });
    }
}

// TodoChecklist.Infrastructure/Persistence/TodoRepository.cs
public class TodoRepository : ITodoRepository {
    private readonly AppDbContext _context;

    public TodoRepository(AppDbContext context) {
        _context = context;
    }

    public async Task<List<Todo>> GetAllAsync() {
        return await _context.Todos.OrderByDescending(t => t.CreatedAt).ToListAsync();
    }

    public async Task<Todo?> GetByIdAsync(Guid id) {
        return await _context.Todos.FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task SaveAsync(Todo todo) {
        if (todo.Id == Guid.Empty) {
            await _context.Todos.AddAsync(todo);
        } else {
            _context.Todos.Update(todo);
        }
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id) {
        var todo = await GetByIdAsync(id);
        if (todo != null) {
            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
        }
    }
}
```

### Backend: API Controller

```csharp
// TodoChecklist.Api/Controllers/TodosController.cs
[ApiController]
[Route("api/todos")]
public class TodosController : ControllerBase {
    private readonly TodoService _service;

    public TodosController(TodoService service) {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<List<TodoDto>>> GetAll() {
        var todos = await _service.GetAllAsync();
        return Ok(todos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TodoDto>> GetById(Guid id) {
        var todo = await _service.GetTodoAsync(id);
        if (todo == null) return NotFound();
        return Ok(todo);
    }

    [HttpPost]
    public async Task<ActionResult<TodoDto>> Create(CreateTodoRequest request) {
        var todo = await _service.AddTodoAsync(request.Title);
        return CreatedAtAction(nameof(GetById), new { id = todo.Id }, todo);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, UpdateTodoRequest request) {
        try {
            await _service.UpdateTodoAsync(id, request.Title);
            return NoContent();
        } catch (KeyNotFoundException) {
            return NotFound();
        }
    }

    [HttpPatch("{id}/toggle")]
    public async Task<IActionResult> Toggle(Guid id) {
        try {
            await _service.CompleteTodoAsync(id);
            return NoContent();
        } catch (KeyNotFoundException) {
            return NotFound();
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id) {
        await _service.DeleteTodoAsync(id);
        return NoContent();
    }
}
```

### Backend: Database Schema

```sql
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Incomplete',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_todos_created_at ON todos(created_at DESC);
```

### Deployment: Fly.io (Docker)

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 as build
WORKDIR /build
COPY . .
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "TodoChecklist.Api.dll"]
```

Deploy:
```bash
flyctl launch
flyctl postgres attach  # Create + attach Postgres
flyctl secrets set DATABASE_URL=...
flyctl deploy
```

---

## Phase 3: Multi-User with JWT Auth

### Overview

Add user accounts with JWT authentication. Each user sees only their todos.

### Frontend Changes

#### 1. New File: `src/context/AuthContext.tsx`

```typescript
import { createContext, useContext, useState, useCallback } from 'react';

interface AuthContextType {
  userId: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(
    localStorage.getItem('userId')
  );

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) throw new Error('Login failed');

    const { token, userId } = await response.json();
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    setUserId(userId);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setUserId(null);
  }, []);

  return (
    <AuthContext.Provider value={{ userId, isAuthenticated: !!userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

#### 2. Update: `src/App.tsx`

```typescript
export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <TodoPage />
      </AuthProvider>
    </ThemeProvider>
  );
}
```

#### 3. Update: `src/presentation/pages/TodoPage.tsx`

```typescript
export function TodoPage() {
  const { userId, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;  // New component
  }

  const apiUrl = process.env.VITE_API_BASE_URL || 'http://localhost:5000';
  const repository = new HttpTodoRepository(apiUrl, userId!);  // Pass userId
  const { todos, addTodo, ... } = useTodos(repository);

  return (
    // existing JSX
  );
}
```

#### 4. Update: `src/infrastructure/HttpTodoRepository.ts`

```typescript
export class HttpTodoRepository implements ITodoRepository {
  constructor(
    private baseUrl: string,
    private userId: string
  ) {}

  async getAll(): Promise<Todo[]> {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`${this.baseUrl}/api/todos`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-User-Id': this.userId,
      },
    });
    // ...
  }

  // Other methods similarly send userId + token
}
```

#### 5. No Changes
- `src/core/` — Same validation
- `src/application/` — Same hook
- Component tests — Still work with `MockTodoRepository`

### Backend Changes

#### 1. New: JWT Auth Middleware

```csharp
// TodoChecklist.Api/Middleware/AuthMiddleware.cs
public class AuthMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<AuthMiddleware> _logger;

    public AuthMiddleware(RequestDelegate next, ILogger<AuthMiddleware> logger) {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context) {
        var token = context.Request.Headers["Authorization"].FirstOrDefault()?.Split(" ").Last();

        if (token != null) {
            try {
                var handler = new JwtSecurityTokenHandler();
                var claimsPrincipal = handler.ValidateToken(token, GetTokenValidationParameters(), out _);
                context.User = claimsPrincipal;
            } catch (Exception ex) {
                _logger.LogWarning($"JWT validation failed: {ex.Message}");
            }
        }

        await _next(context);
    }

    private static TokenValidationParameters GetTokenValidationParameters() {
        return new TokenValidationParameters {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Environment.GetEnvironmentVariable("JWT_KEY")!)),
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    }
}
```

#### 2. New: Users Table and Auth Service

```csharp
// Domain/Entities/User.cs
public class User {
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public ICollection<Todo> Todos { get; set; } = new List<Todo>();
}

// Domain/Entities/Todo.cs (updated)
public class Todo {
    // ... existing properties ...
    public Guid UserId { get; set; }  // ← NEW
    public User User { get; set; } = null!;
}
```

#### 3. Update: TodoRepository (Filter by UserId)

```csharp
public class TodoRepository : ITodoRepository {
    private readonly AppDbContext _context;
    private readonly Guid _userId;

    public TodoRepository(AppDbContext context, Guid userId) {
        _context = context;
        _userId = userId;
    }

    public async Task<List<Todo>> GetAllAsync() {
        return await _context.Todos
            .Where(t => t.UserId == _userId)  // ← Filter by user
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    // All other methods filter by _userId similarly
}
```

#### 4. New: AuthController

```csharp
[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase {
    private readonly AuthService _authService;

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request) {
        try {
            var (user, token) = await _authService.AuthenticateAsync(request.Email, request.Password);
            return Ok(new LoginResponse { UserId = user.Id, Token = token });
        } catch {
            return Unauthorized();
        }
    }

    [HttpPost("register")]
    public async Task<ActionResult<RegisterResponse>> Register(RegisterRequest request) {
        var user = await _authService.RegisterAsync(request.Email, request.Password);
        return Created($"/api/users/{user.Id}", new { userId = user.Id });
    }
}
```

#### 5. Update: Program.cs (DI Setup)

```csharp
var builder = WebApplicationBuilder.CreateBuilder(args);

// Add services
builder.Services.AddScoped<AppDbContext>();
builder.Services.AddScoped<TodoService>();
builder.Services.AddScoped<AuthService>();

// Add JWT authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = GetTokenValidationParameters();
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Add middleware
app.UseAuthentication();
app.UseAuthorization();

// Protect endpoints
app.MapControllers()
    .RequireAuthorization();

app.Run();
```

#### 6. Database Migration

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE todos ADD COLUMN user_id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE todos ADD CONSTRAINT fk_todos_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

CREATE INDEX idx_todos_user_id ON todos(user_id);
```

---

## Summary

### Phase 2 Frontend Effort
- Add 1 file: `HttpTodoRepository`
- Update 2 files: `TodoPage`, `.env.example`
- 0 changes to business logic, validation, components, or tests

### Phase 2 Backend Effort
- C# project with 4 layers (Domain, Application, Infrastructure, API)
- ~500 lines of C# code
- Postgres database with simple schema

### Phase 3 Frontend Effort
- Add 1 file: `AuthContext`
- Update 2 files: `App`, `TodoPage`
- No changes to todo-specific logic

### Phase 3 Backend Effort
- Add JWT auth middleware
- Add users table and auth controller
- Filter todos by `UserId` in repository

**Key Theme**: Architecture is designed for **zero refactoring** of working code. Each phase adds new capabilities without rewriting the previous phase.
