import { z } from 'zod';
import { authenticate, requireRole } from '../auth/index.js';
import { cedulaParamSchema, ciudadanoMayorConMenoresSchema, ciudadanoMayorDetalleSchema, ciudadanoMenorDetalleSchema, ciudadanosMayoresQuerySchema, ciudadanosMenoresQuerySchema, createCiudadanoMayorBodySchema, createCiudadanoMenorBodySchema, createMenorDeRepresentanteBodySchema, deleteCiudadanoResponseSchema, idParamSchema, okSchema, updateCiudadanoMayorBodySchema, updateCiudadanoMenorBodySchema, } from './ciudadanos.schemas.js';
import { createCiudadanoMayor, createCiudadanoMenor, deleteCiudadanoMayor, deleteCiudadanoMenor, getCiudadanoMayorByCedula, getCiudadanoMayorById, getCiudadanoMenorById, listCiudadanosMayores, listCiudadanosMenores, listMenoresByPadreId, updateCiudadanoMayor, updateCiudadanoMenor, } from './ciudadanos.service.js';
export const ciudadanosRoutes = async (app) => {
    const typedApp = app.withTypeProvider();
    const writeRoles = ['master', 'subregion', 'centro_salud_jefe'];
    // Búsqueda directa por cédula (c_i)
    typedApp.get('/cedula/:ci', {
        preHandler: [authenticate],
        schema: {
            params: cedulaParamSchema,
            response: {
                200: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCiudadanoMayorByCedula(request.params.ci),
    }));
    typedApp.get('/mayores/cedula/:ci', {
        preHandler: [authenticate],
        schema: {
            params: cedulaParamSchema,
            response: {
                200: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCiudadanoMayorByCedula(request.params.ci),
    }));
    // Listado y registro de ciudadanos mayores de edad
    typedApp.get('/', {
        preHandler: [authenticate],
        schema: {
            querystring: ciudadanosMayoresQuerySchema,
            response: {
                200: okSchema(z.array(ciudadanoMayorDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listCiudadanosMayores(request.query),
    }));
    typedApp.get('/mayores', {
        preHandler: [authenticate],
        schema: {
            querystring: ciudadanosMayoresQuerySchema,
            response: {
                200: okSchema(z.array(ciudadanoMayorDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listCiudadanosMayores(request.query),
    }));
    typedApp.get('/mayores/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCiudadanoMayorById(request.params.id),
    }));
    typedApp.post('/', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            body: createCiudadanoMayorBodySchema,
            response: {
                201: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createCiudadanoMayor(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.post('/mayores', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            body: createCiudadanoMayorBodySchema,
            response: {
                201: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createCiudadanoMayor(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/mayores/:id', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            params: idParamSchema,
            body: updateCiudadanoMayorBodySchema,
            response: {
                200: okSchema(ciudadanoMayorConMenoresSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateCiudadanoMayor(request.params.id, request.body),
    }));
    typedApp.delete('/mayores/:id', {
        preHandler: [requireRole('master')],
        schema: {
            params: idParamSchema,
            response: {
                200: deleteCiudadanoResponseSchema,
            },
        },
    }, async (request) => {
        await deleteCiudadanoMayor(request.params.id);
        return {
            ok: true,
            message: 'Ciudadano mayor de edad eliminado correctamente.',
        };
    });
    // Gestión de menores vinculados a un representante específico
    typedApp.get('/mayores/:id/menores', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(z.array(ciudadanoMenorDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listMenoresByPadreId(request.params.id),
    }));
    typedApp.post('/mayores/:id/menores', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            params: idParamSchema,
            body: createMenorDeRepresentanteBodySchema,
            response: {
                201: okSchema(ciudadanoMenorDetalleSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createCiudadanoMenor({
            ...request.body,
            padre_id: request.params.id,
        });
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    // Endpoints directos para ciudadanos menores de edad
    typedApp.get('/menores', {
        preHandler: [authenticate],
        schema: {
            querystring: ciudadanosMenoresQuerySchema,
            response: {
                200: okSchema(z.array(ciudadanoMenorDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listCiudadanosMenores(request.query),
    }));
    typedApp.get('/menores/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(ciudadanoMenorDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCiudadanoMenorById(request.params.id),
    }));
    typedApp.post('/menores', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            body: createCiudadanoMenorBodySchema,
            response: {
                201: okSchema(ciudadanoMenorDetalleSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createCiudadanoMenor(request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/menores/:id', {
        preHandler: [requireRole(writeRoles)],
        schema: {
            params: idParamSchema,
            body: updateCiudadanoMenorBodySchema,
            response: {
                200: okSchema(ciudadanoMenorDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateCiudadanoMenor(request.params.id, request.body),
    }));
    typedApp.delete('/menores/:id', {
        preHandler: [requireRole('master')],
        schema: {
            params: idParamSchema,
            response: {
                200: deleteCiudadanoResponseSchema,
            },
        },
    }, async (request) => {
        await deleteCiudadanoMenor(request.params.id);
        return {
            ok: true,
            message: 'Ciudadano menor de edad eliminado correctamente.',
        };
    });
};
//# sourceMappingURL=ciudadanos.routes.js.map