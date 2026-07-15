namespace Chat.Domain;

/// <summary>
/// Mirrors the frontend's <c>{ valid, errors[] }</c> validation shape so both
/// sides of the wire reason about validation the same way.
/// </summary>
public sealed record ValidationResult(bool Valid, IReadOnlyList<string> Errors)
{
    public static ValidationResult Success() => new(true, Array.Empty<string>());

    public static ValidationResult Failure(params string[] errors) => new(false, errors);
}
