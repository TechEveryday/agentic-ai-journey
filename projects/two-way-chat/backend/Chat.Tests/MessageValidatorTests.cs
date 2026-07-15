using Chat.Domain;

namespace Chat.Tests;

public class MessageValidatorTests
{
    [Fact]
    public void ValidateText_EmptyString_IsInvalid()
    {
        var result = MessageValidator.ValidateText("");

        Assert.False(result.Valid);
        Assert.Contains("Message text cannot be empty", result.Errors);
    }

    [Fact]
    public void ValidateText_WhitespaceOnly_IsInvalid()
    {
        var result = MessageValidator.ValidateText("   ");

        Assert.False(result.Valid);
        Assert.Contains("Message text cannot be empty", result.Errors);
    }

    [Fact]
    public void ValidateText_Null_IsInvalid()
    {
        var result = MessageValidator.ValidateText(null);

        Assert.False(result.Valid);
    }

    [Fact]
    public void ValidateText_AtMaxLength_IsValid()
    {
        var text = new string('a', MessageValidator.MaxTextLength);

        var result = MessageValidator.ValidateText(text);

        Assert.True(result.Valid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void ValidateText_OverMaxLength_IsInvalid()
    {
        var text = new string('a', MessageValidator.MaxTextLength + 1);

        var result = MessageValidator.ValidateText(text);

        Assert.False(result.Valid);
        Assert.Contains($"Message text must be {MessageValidator.MaxTextLength} characters or less", result.Errors);
    }

    [Fact]
    public void ValidateText_ValidText_IsValid()
    {
        var result = MessageValidator.ValidateText("Hello there");

        Assert.True(result.Valid);
        Assert.Empty(result.Errors);
    }

    [Fact]
    public void ValidateSenderName_Empty_IsInvalid()
    {
        var result = MessageValidator.ValidateSenderName("");

        Assert.False(result.Valid);
        Assert.Contains("Sender name cannot be empty", result.Errors);
    }

    [Fact]
    public void ValidateSenderName_WhitespaceOnly_IsInvalid()
    {
        var result = MessageValidator.ValidateSenderName("   ");

        Assert.False(result.Valid);
    }

    [Fact]
    public void ValidateSenderName_Valid_IsValid()
    {
        var result = MessageValidator.ValidateSenderName("Alex");

        Assert.True(result.Valid);
    }

    [Fact]
    public void ValidateRoomId_Empty_IsInvalid()
    {
        var result = MessageValidator.ValidateRoomId("");

        Assert.False(result.Valid);
        Assert.Contains("Room id cannot be empty", result.Errors);
    }

    [Fact]
    public void ValidateRoomId_Valid_IsValid()
    {
        var result = MessageValidator.ValidateRoomId("general");

        Assert.True(result.Valid);
    }

    [Fact]
    public void Validate_AllInvalid_CollectsAllErrors()
    {
        var result = MessageValidator.Validate("", "", "");

        Assert.False(result.Valid);
        Assert.Equal(3, result.Errors.Count);
    }

    [Fact]
    public void Validate_AllValid_IsValid()
    {
        var result = MessageValidator.Validate("general", "Alex", "Hello");

        Assert.True(result.Valid);
        Assert.Empty(result.Errors);
    }
}
