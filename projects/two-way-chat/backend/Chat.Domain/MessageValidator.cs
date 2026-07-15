namespace Chat.Domain;

/// <summary>
/// Pure validation rules for chat messages. No dependencies on any other
/// project or on ASP.NET — this must be usable from Domain alone.
/// </summary>
public static class MessageValidator
{
    public const int MaxTextLength = 1000;

    public static ValidationResult ValidateText(string? text)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(text))
        {
            errors.Add("Message text cannot be empty");
        }
        else if (text.Trim().Length > MaxTextLength)
        {
            errors.Add($"Message text must be {MaxTextLength} characters or less");
        }

        return errors.Count == 0 ? ValidationResult.Success() : new ValidationResult(false, errors);
    }

    public static ValidationResult ValidateSenderName(string? senderName)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(senderName))
        {
            errors.Add("Sender name cannot be empty");
        }

        return errors.Count == 0 ? ValidationResult.Success() : new ValidationResult(false, errors);
    }

    public static ValidationResult ValidateRoomId(string? roomId)
    {
        var errors = new List<string>();

        if (string.IsNullOrWhiteSpace(roomId))
        {
            errors.Add("Room id cannot be empty");
        }

        return errors.Count == 0 ? ValidationResult.Success() : new ValidationResult(false, errors);
    }

    /// <summary>
    /// Validates the full set of inputs needed to construct a <see cref="Message"/>,
    /// collecting errors from all three individual checks.
    /// </summary>
    public static ValidationResult Validate(string? roomId, string? senderName, string? text)
    {
        var errors = new List<string>();
        errors.AddRange(ValidateRoomId(roomId).Errors);
        errors.AddRange(ValidateSenderName(senderName).Errors);
        errors.AddRange(ValidateText(text).Errors);

        return errors.Count == 0 ? ValidationResult.Success() : new ValidationResult(false, errors);
    }
}
