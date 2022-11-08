namespace PokerTime.Core.Enums
{
    public enum ClientEventType
    {
        CardSelected,
        CardSelectedSelf,
        CardDeselected,
        GameEnded,
        PauseToggled,
        RoundStoryPointsSet,
        PlayerDisconnected,
        PlayerConnected,
        WorkItemSelected,
        CardsWereFlipped,
        ShouldRefreshGame
    }
}