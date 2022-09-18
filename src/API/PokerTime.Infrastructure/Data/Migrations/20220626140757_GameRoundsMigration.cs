using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokerTime.Infrastructure.Migrations
{
    public partial class GameRoundsMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationUsers",
                schema: "poker-time");

            migrationBuilder.CreateTable(
                name: "GameRounds",
                schema: "poker-time",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    GameId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    WorkItemId = table.Column<int>(type: "int", maxLength: 36, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()"),
                    SubmittedStoryPoints = table.Column<float>(type: "real", nullable: true),
                    CardsWereFlipped = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameRounds", x => x.Id);
                    table.ForeignKey(
                        name: "FK_GameRounds_Games_GameId",
                        column: x => x.GameId,
                        principalSchema: "poker-time",
                        principalTable: "Games",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Players",
                schema: "poker-time",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastConnectedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Players", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GameRoundPlayers",
                schema: "poker-time",
                columns: table => new
                {
                    RoundId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    PlayerId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GameRoundPlayers", x => new { x.PlayerId, x.RoundId });
                    table.ForeignKey(
                        name: "FK_GameRoundPlayers_GameRounds_RoundId",
                        column: x => x.RoundId,
                        principalSchema: "poker-time",
                        principalTable: "GameRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_GameRoundPlayers_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalSchema: "poker-time",
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PlayedCards",
                schema: "poker-time",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Value = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    PlayerId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    RoundId = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    PlayedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PlayedCards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PlayedCards_GameRounds_RoundId",
                        column: x => x.RoundId,
                        principalSchema: "poker-time",
                        principalTable: "GameRounds",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PlayedCards_Players_PlayerId",
                        column: x => x.PlayerId,
                        principalSchema: "poker-time",
                        principalTable: "Players",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GameRoundPlayers_RoundId",
                schema: "poker-time",
                table: "GameRoundPlayers",
                column: "RoundId");

            migrationBuilder.CreateIndex(
                name: "IX_GameRounds_GameId",
                schema: "poker-time",
                table: "GameRounds",
                column: "GameId");

            migrationBuilder.CreateIndex(
                name: "IX_GameRounds_WorkItemId",
                schema: "poker-time",
                table: "GameRounds",
                column: "WorkItemId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayedCards_PlayerId",
                schema: "poker-time",
                table: "PlayedCards",
                column: "PlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_PlayedCards_RoundId",
                schema: "poker-time",
                table: "PlayedCards",
                column: "RoundId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "GameRoundPlayers",
                schema: "poker-time");

            migrationBuilder.DropTable(
                name: "PlayedCards",
                schema: "poker-time");

            migrationBuilder.DropTable(
                name: "GameRounds",
                schema: "poker-time");

            migrationBuilder.DropTable(
                name: "Players",
                schema: "poker-time");

            migrationBuilder.CreateTable(
                name: "ApplicationUsers",
                schema: "poker-time",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(36)", maxLength: 36, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    LastConnectedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUsers", x => x.Id);
                });
        }
    }
}
