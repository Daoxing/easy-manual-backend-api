import * as Knex from 'knex';
import { GENDER_OPTIONS, UNKNOWN } from '../src/constants/user';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('user', function (table) {
    table
      .uuid('user_id')
      .notNullable()
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'));
    table.text('user_nme').notNullable().defaultTo('').unique();
    table.text('display_nme').nullable().defaultTo('');
    table.text('email_address').nullable().unique();
    table.text('phone_nbr').nullable().unique();
    table.text('icon_url').nullable();
    table.string('verify_code', 6).nullable().defaultTo(null);
    table.timestamp('verify_code_created_tms').nullable().defaultTo(null);
    table.timestamp('created_tms').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_tms').notNullable().defaultTo(knex.fn.now());
    table.timestamp('last_login_tms').notNullable().defaultTo(knex.fn.now());
    table.boolean('read_recent_terms').defaultTo(false);
    table.boolean('onboard').defaultTo(false);
    table.boolean('deleted').defaultTo(false);
    table.enu('gender', GENDER_OPTIONS).defaultTo(UNKNOWN);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('user');
}
