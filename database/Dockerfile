FROM postgres:15

ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=aicalling

COPY init.sql /docker-entrypoint-initdb.d/
