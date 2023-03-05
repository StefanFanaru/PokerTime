using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PokerTime.Core.Entities;
using PokerTime.Infrastructure.Data.Repositories;

namespace PokerTime.Infrastructure.Commands.PlayingCards;

public class PlayingCardsUpdateIndexesService
{
    private readonly IRepository _repository;

    public PlayingCardsUpdateIndexesService(IRepository repository)
    {
        _repository = repository;
    }

    public async Task Update(List<string> idsOrdered, string organizationId, CancellationToken cancellationToken)
    {
        var cards = await _repository.Query<PlayingCard>()
            .Where(x => x.OrganizationId == organizationId)
            .Where(x => !x.IsDeleted)
            .ToListAsync(cancellationToken);

        foreach (var card in cards)
        {
            card.Index = idsOrdered.IndexOf(card.Id);
            _repository.Update(card);
        }

        await _repository.SaveAsync(cancellationToken);
    }
}