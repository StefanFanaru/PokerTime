using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokerTime.Infrastructure.Migrations
{
    public partial class PlayingCardsMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Value",
                schema: "poker-time",
                table: "PlayedCards");

            migrationBuilder.AddColumn<string>(
                name: "PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PlayingCards",
                schema: "poker-time",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Content = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    Color = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Index = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayingCards", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PlayedCards_PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards",
                column: "PlayingCardId");

            migrationBuilder.AddForeignKey(
                name: "FK_PlayedCards_PlayingCards_PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards",
                column: "PlayingCardId",
                principalSchema: "poker-time",
                principalTable: "PlayingCards",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlayedCards_PlayingCards_PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards");

            migrationBuilder.DropTable(
                name: "PlayingCards",
                schema: "poker-time");

            migrationBuilder.DropIndex(
                name: "IX_PlayedCards_PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards");

            migrationBuilder.DropColumn(
                name: "PlayingCardId",
                schema: "poker-time",
                table: "PlayedCards");

            migrationBuilder.AddColumn<string>(
                name: "Value",
                schema: "poker-time",
                table: "PlayedCards",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");
        }
    }
}
