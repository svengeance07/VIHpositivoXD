import { z } from 'zod';
import { authenticate, requireRole } from '../auth/index.js';
import { catalogosResumenSchema, createExamenBodySchema, createSintomaComunBodySchema, createVacunaBodySchema, estadoSchema, etniaSchema, examenSchema, idParamSchema, municipioSchema, municipiosQuerySchema, okSchema, parroquiaSchema, parroquiasQuerySchema, profesionSchema, sintomaComunSchema, updateVacunaBodySchema, vacunaSchema, } from './catalogos.schemas.js';
import { createExamen, createSintomaComun, createVacuna, getCatalogosResumen, getVacunaById, listEstados, listEtnias, listExamenes, listMunicipios, listParroquias, listProfesiones, listSintomasComunes, listVacunas, updateVacuna, } from './catalogos.service.js';
export const catalogosRoutes = async (app) => {
    const typedApp = app.withTypeProvider();
    typedApp.get('/resumen', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(catalogosResumenSchema),
            },
        },
    }, async () => ({
        ok: true,
        data: await getCatalogosResumen(),
    }));
    typedApp.get('/estados', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(estadoSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listEstados(),
    }));
    typedApp.get('/municipios', {
        preHandler: [authenticate],
        schema: {
            querystring: municipiosQuerySchema,
            response: {
                200: okSchema(z.array(municipioSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listMunicipios(request.query.estado_id),
    }));
    typedApp.get('/parroquias', {
        preHandler: [authenticate],
        schema: {
            querystring: parroquiasQuerySchema,
            response: {
                200: okSchema(z.array(parroquiaSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listParroquias(request.query),
    }));
    typedApp.get('/etnias', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(etniaSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listEtnias(),
    }));
    typedApp.get('/profesiones', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(profesionSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listProfesiones(),
    }));
    typedApp.get('/vacunas', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(vacunaSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listVacunas(),
    }));
    typedApp.get('/vacunas/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(vacunaSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getVacunaById(request.params.id),
    }));
    typedApp.post('/vacunas', {
        preHandler: [requireRole('master')],
        schema: {
            body: createVacunaBodySchema,
            response: {
                201: okSchema(vacunaSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createVacuna(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/vacunas/:id', {
        preHandler: [requireRole('master')],
        schema: {
            params: idParamSchema,
            body: updateVacunaBodySchema,
            response: {
                200: okSchema(vacunaSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateVacuna(request.params.id, request.body),
    }));
    typedApp.get('/sintomas-comunes', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(sintomaComunSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listSintomasComunes(),
    }));
    typedApp.post('/sintomas-comunes', {
        preHandler: [requireRole('master')],
        schema: {
            body: createSintomaComunBodySchema,
            response: {
                201: okSchema(sintomaComunSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createSintomaComun(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.get('/examenes', {
        preHandler: [authenticate],
        schema: {
            response: {
                200: okSchema(z.array(examenSchema)),
            },
        },
    }, async () => ({
        ok: true,
        data: await listExamenes(),
    }));
    typedApp.post('/examenes', {
        preHandler: [requireRole('master')],
        schema: {
            body: createExamenBodySchema,
            response: {
                201: okSchema(examenSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createExamen(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
};
//# sourceMappingURL=catalogos.routes.js.map