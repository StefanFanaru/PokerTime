using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokerTime.Infrastructure.Migrations
{
    public partial class PlayingCardIsLegacy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLegacy",
                schema: "poker-time",
                table: "PlayingCards",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLegacy",
                schema: "poker-time",
                table: "PlayingCards");
        }
    }
}
