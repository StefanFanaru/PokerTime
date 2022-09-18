using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PokerTime.Infrastructure.Migrations
{
    public partial class VelocityNullableMigration : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Velocity",
                schema: "poker-time",
                table: "Games",
                type: "real",
                nullable: true,
                oldClrType: typeof(float),
                oldType: "real");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<float>(
                name: "Velocity",
                schema: "poker-time",
                table: "Games",
                type: "real",
                nullable: false,
                defaultValue: 0f,
                oldClrType: typeof(float),
                oldType: "real",
                oldNullable: true);
        }
    }
}
