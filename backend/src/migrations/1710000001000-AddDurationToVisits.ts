import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDurationToVisits1710000001000 implements MigrationInterface {
  name = 'AddDurationToVisits1710000001000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "visits" ADD "duration" integer NULL`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "visits" DROP COLUMN "duration"`
    );
  }
} 