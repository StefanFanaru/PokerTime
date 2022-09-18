using System.Text.RegularExpressions;

namespace PokerTime.Core.Helpers
{
    public static class StringExtensions
    {
        public static string FormatType(this string type)
        {
            return Regex.Replace(type, @"((?<=\p{Ll})\p{Lu})|((?!\A)\p{Lu}(?>\p{Ll}))", " $0");
        }
    }
}