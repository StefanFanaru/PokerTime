using System;

namespace PokerTime.Infrastructure.CQRS
{
    public static class Generics
    {
        public static IEnumerable<TypeEntryWithParameters> DerivedOf(IEnumerable<Type> types, Type openGeneric)
        {
            foreach (var type in types.Where(t => t.IsPublic))
            {
                var entry = MatchForOpenGenerics(type, openGeneric);
                if (entry != null)
                {
                    yield return entry;
                }
            }
        }

        public static Func<IEnumerable<Type>, IEnumerable<TypeEntryWithParameters>> DerivedOf(Type openGenericType)
        {
            return types => DerivedOf(types, openGenericType);
        }

        public static TypeEntryWithParameters MatchForOpenGenerics(Type type, Type openGeneric)
        {
            if (type == null || openGeneric == null)
            {
                return null;
            }

            if (type.IsGenericType && type.GetGenericTypeDefinition() == openGeneric)
            {
                return new TypeEntryWithParameters(type, type,
                    type.GetGenericArguments().ElementAtOrDefault(0),
                    type.GetGenericArguments().ElementAtOrDefault(1));
            }

            if (openGeneric.IsInterface)
            {
                var baseInterface = type.GetInterfaces()
                    .Where(x => x.IsGenericType)
                    .Select(x => new
                    {
                        ClosedGenericType = x,
                        OpenGenericType = x.GetGenericTypeDefinition(),
                        Arguments = x.GetGenericArguments()
                    }).FirstOrDefault(x => x.OpenGenericType == openGeneric);

                if (baseInterface != null)
                {
                    return new TypeEntryWithParameters(type, baseInterface.ClosedGenericType,
                        baseInterface.Arguments.ElementAtOrDefault(0),
                        baseInterface.Arguments.ElementAtOrDefault(1));
                }
            }

            return null;
        }
    }

    public class TypeEntry
    {
        public TypeEntry(Type type, Type closedGenericType)
        {
            Type = type;
            ClosedGenericType = closedGenericType;
        }

        public Type Type { get; }
        public Type ClosedGenericType { get; }
    }

    public class TypeEntryWithParameters : TypeEntry
    {
        public TypeEntryWithParameters(Type type, Type closedGenericType, Type param1, Type param2) : base(type,
            closedGenericType)
        {
            Param1 = param1;
            Param2 = param2;
        }

        public Type Param1 { get; }
        public Type Param2 { get; }
    }
}