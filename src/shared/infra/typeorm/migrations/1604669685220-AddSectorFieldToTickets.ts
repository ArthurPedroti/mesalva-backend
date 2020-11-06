import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddSectorFieldToTickets1604669685220
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'tickets',
      new TableColumn({
        name: 'sector',
        type: 'varchar',
        default: "'Não classificado'",
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('tickets', 'avatar');
  }
}
