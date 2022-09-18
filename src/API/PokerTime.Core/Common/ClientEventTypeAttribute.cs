using System;

namespace PokerTime.Core.Common
{
    [AttributeUsage(AttributeTargets.Class)]
    public class ClientEventTypeAttribute : Attribute
    {
        public ClientEventTypeAttribute(string name)
        {
            Name = name;
        }

        public string Name { get; }
    }
}