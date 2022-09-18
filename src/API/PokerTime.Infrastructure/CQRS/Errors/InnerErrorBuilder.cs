using System;

namespace PokerTime.Infrastructure.CQRS.Errors
{
    public class InnerErrorBuilder
    {
        private readonly string _code;
        private Func<InnerErrorBuilder> _innerBuilder;

        public InnerErrorBuilder(string code)
        {
            _code = code;
        }

        public InnerErrorData Build()
        {
            if (_innerBuilder == null)
            {
                return new InnerErrorData
                {
                    Code = _code
                };
            }

            return new InnerErrorData
            {
                Code = _code,
                InnerError = _innerBuilder().Build()
            };
        }

        public InnerErrorBuilder WithInner(Func<InnerErrorBuilder> innerBuilderFunc)
        {
            _innerBuilder = innerBuilderFunc;
            return this;
        }
    }
}