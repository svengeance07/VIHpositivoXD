import type { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

import { authenticate, requireRole } from '../auth/index.js';
import {
  autoridadDetalleSchema,
  autoridadesQuerySchema,
  centroSaludDetalleSchema,
  centrosSaludQuerySchema,
  createAutoridadBodySchema,
  createCentroSaludBodySchema,
  createSubregionBodySchema,
  idParamSchema,
  okSchema,
  subregionDetalleSchema,
  subregionesQuerySchema,
  updateAutoridadBodySchema,
  updateCentroSaludBodySchema,
  updateSubregionBodySchema,
} from './centros.schemas.js';
import {
  createAutoridad,
  createCentroSalud,
  createSubregion,
  getAutoridadById,
  getCentroSaludById,
  getSubregionById,
  listAutoridades,
  listCentrosSalud,
  listSubregiones,
  updateAutoridad,
  updateCentroSalud,
  updateSubregion,
} from './centros.service.js';

export const subregionesRoutes: FastifyPluginAsync = async (app) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        querystring: subregionesQuerySchema,
        response: {
          200: okSchema(z.array(subregionDetalleSchema)),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await listSubregiones(request.user, request.query),
    }),
  );

  typedApp.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        params: idParamSchema,
        response: {
          200: okSchema(subregionDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await getSubregionById(request.user, request.params.id),
    }),
  );

  typedApp.post(
    '/',
    {
      preHandler: [requireRole('master')],
      schema: {
        body: createSubregionBodySchema,
        response: {
          201: okSchema(subregionDetalleSchema),
        },
      },
    },
    async (request, reply) => {
      const created = await createSubregion(request.body);
      return reply.status(201).send({
        ok: true as const,
        data: created,
      });
    },
  );

  typedApp.patch(
    '/:id',
    {
      preHandler: [requireRole('master')],
      schema: {
        params: idParamSchema,
        body: updateSubregionBodySchema,
        response: {
          200: okSchema(subregionDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await updateSubregion(request.params.id, request.body),
    }),
  );
};

export const autoridadesRoutes: FastifyPluginAsync = async (app) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        querystring: autoridadesQuerySchema,
        response: {
          200: okSchema(z.array(autoridadDetalleSchema)),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await listAutoridades(request.user, request.query),
    }),
  );

  typedApp.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        params: idParamSchema,
        response: {
          200: okSchema(autoridadDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await getAutoridadById(request.user, request.params.id),
    }),
  );

  typedApp.post(
    '/',
    {
      preHandler: [requireRole('master', 'subregion')],
      schema: {
        body: createAutoridadBodySchema,
        response: {
          201: okSchema(autoridadDetalleSchema),
        },
      },
    },
    async (request, reply) => {
      const created = await createAutoridad(request.user, request.body);
      return reply.status(201).send({
        ok: true as const,
        data: created,
      });
    },
  );

  typedApp.patch(
    '/:id',
    {
      preHandler: [requireRole('master', 'subregion')],
      schema: {
        params: idParamSchema,
        body: updateAutoridadBodySchema,
        response: {
          200: okSchema(autoridadDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await updateAutoridad(request.user, request.params.id, request.body),
    }),
  );
};

export const centrosRoutes: FastifyPluginAsync = async (app) => {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  await typedApp.register(subregionesRoutes, { prefix: '/subregiones' });
  await typedApp.register(autoridadesRoutes, { prefix: '/autoridades' });

  typedApp.get(
    '/',
    {
      preHandler: [authenticate],
      schema: {
        querystring: centrosSaludQuerySchema,
        response: {
          200: okSchema(z.array(centroSaludDetalleSchema)),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await listCentrosSalud(request.user, request.query),
    }),
  );

  typedApp.get(
    '/:id',
    {
      preHandler: [authenticate],
      schema: {
        params: idParamSchema,
        response: {
          200: okSchema(centroSaludDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await getCentroSaludById(request.user, request.params.id),
    }),
  );

  typedApp.post(
    '/',
    {
      preHandler: [requireRole('master', 'subregion')],
      schema: {
        body: createCentroSaludBodySchema,
        response: {
          201: okSchema(centroSaludDetalleSchema),
        },
      },
    },
    async (request, reply) => {
      const created = await createCentroSalud(request.user, request.body);
      return reply.status(201).send({
        ok: true as const,
        data: created,
      });
    },
  );

  typedApp.patch(
    '/:id',
    {
      preHandler: [requireRole('master', 'subregion')],
      schema: {
        params: idParamSchema,
        body: updateCentroSaludBodySchema,
        response: {
          200: okSchema(centroSaludDetalleSchema),
        },
      },
    },
    async (request) => ({
      ok: true as const,
      data: await updateCentroSalud(request.user, request.params.id, request.body),
    }),
  );
};
