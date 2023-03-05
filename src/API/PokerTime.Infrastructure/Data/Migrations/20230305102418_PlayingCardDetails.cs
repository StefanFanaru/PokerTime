using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokerTime.Infrastructure.Migrations
{
    public partial class PlayingCardDetails : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Content",
                schema: "poker-time",
                table: "PlayingCards",
                type: "nvarchar(3)",
                maxLength: 3,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<bool>(
                name: "IsDefault",
                schema: "poker-time",
                table: "PlayingCards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                schema: "poker-time",
                table: "PlayingCards",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "OrganizationId",
                schema: "poker-time",
                table: "PlayingCards",
                type: "nvarchar(36)",
                maxLength: 36,
                nullable: false,
                defaultValue: "");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsDefault",
                schema: "poker-time",
                table: "PlayingCards");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                schema: "poker-time",
                table: "PlayingCards");

            migrationBuilder.DropColumn(
                name: "OrganizationId",
                schema: "poker-time",
                table: "PlayingCards");

            migrationBuilder.AlterColumn<string>(
                name: "Content",
                schema: "poker-time",
                table: "PlayingCards",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(3)",
                oldMaxLength: 3);
        }
    }
}
