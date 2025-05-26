set search_path to tactics; /* поменяй на свою */

CREATE TABLE IF NOT EXISTS "field" (
	"id" serial NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "player" (
	"num_row" serial NOT NULL,
	"id_field" bigint NOT NULL,
	"coordinates" point NOT NULL,
	"color" varchar(22) NOT NULL,
	PRIMARY KEY ("num_row")
);

CREATE TABLE IF NOT EXISTS "ball" (
	"num_row" serial NOT NULL,
	"id_field" bigint NOT NULL,
	"coordinates" point NOT NULL,
	"color" varchar(22) NOT NULL,
	PRIMARY KEY ("num_row")
);

CREATE TABLE IF NOT EXISTS "cone" (
	"num_row" serial NOT NULL,
	"id_field" bigint NOT NULL,
	"coordinates" point NOT NULL,
	"color" varchar(22) NOT NULL,
	PRIMARY KEY ("num_row")
);

CREATE TABLE IF NOT EXISTS "line" (
	"num_row" serial NOT NULL,
	"id_field" bigint NOT NULL,
	"coordinates_start" point NOT NULL,
	"coordinates_end" point NOT NULL,
	"color" varchar(22) NOT NULL,
	"type_line" varchar(10) NOT NULL,
	PRIMARY KEY ("num_row")
);

CREATE TABLE IF NOT EXISTS "number" (
	"num_row" serial NOT NULL,
	"coordinates" point NOT NULL,
	"id_field" bigint NOT NULL,
	"color" varchar(22) NOT NULL,
	"number" smallint NOT NULL,
	PRIMARY KEY ("num_row")
);

ALTER TABLE "player" ADD CONSTRAINT "player_fk"
	FOREIGN KEY ("id_field") REFERENCES "field"("id") ON DELETE CASCADE;

ALTER TABLE "ball" ADD CONSTRAINT "ball_fk"
	FOREIGN KEY ("id_field") REFERENCES "field"("id") ON DELETE CASCADE;

ALTER TABLE "cone" ADD CONSTRAINT "cone_fk"
	FOREIGN KEY ("id_field") REFERENCES "field"("id") ON DELETE CASCADE;

ALTER TABLE "line" ADD CONSTRAINT "line_fk"
	FOREIGN KEY ("id_field") REFERENCES "field"("id") ON DELETE CASCADE;

ALTER TABLE "number" ADD CONSTRAINT "number_fk"
	FOREIGN KEY ("id_field") REFERENCES "field"("id") ON DELETE CASCADE;
