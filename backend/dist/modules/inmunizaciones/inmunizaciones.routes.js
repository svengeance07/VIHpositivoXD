import { z } from 'zod';
import { authenticate, requireRole } from '../auth/index.js';
import { cartillaFamiliarCedulaSchema, cartillaVacunacionCiudadanoSchema, cedulaParamSchema, createInmunizacionBodySchema, idParamSchema, inmunizacionDetalleSchema, inmunizacionesQuerySchema, okSchema, updateInmunizacionBodySchema, } from './inmunizaciones.schemas.js';
import { createInmunizacion, getCartillaByCiudadanoMayorId, getCartillaByCiudadanoMenorId, getCartillaFamiliarByCedula, getInmunizacionById, listInmunizaciones, updateInmunizacion, } from './inmunizaciones.service.js';
export const inmunizacionesRoutes = async (app) => {
    const typedApp = app.withTypeProvider();
    const clinicalRoles = ['master', 'subregion', 'centro_salud_jefe'];
    typedApp.get('/', {
        preHandler: [authenticate],
        schema: {
            querystring: inmunizacionesQuerySchema,
            response: {
                200: okSchema(z.array(inmunizacionDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listInmunizaciones(request.user, request.query),
    }));
    typedApp.get('/cedula/:ci', {
        preHandler: [authenticate],
        schema: {
            params: cedulaParamSchema,
            response: {
                200: okSchema(cartillaFamiliarCedulaSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCartillaFamiliarByCedula(request.params.ci),
    }));
    typedApp.get('/ciudadano/mayor/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(cartillaVacunacionCiudadanoSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCartillaByCiudadanoMayorId(request.params.id),
    }));
    typedApp.get('/ciudadano/menor/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(cartillaVacunacionCiudadanoSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCartillaByCiudadanoMenorId(request.params.id),
    }));
    typedApp.get('/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(inmunizacionDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getInmunizacionById(request.user, request.params.id),
    }));
    typedApp.post('/', {
        preHandler: [requireRole(clinicalRoles)],
        schema: {
            body: createInmunizacionBodySchema,
            response: {
                201: okSchema(inmunizacionDetalleSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createInmunizacion(request.user, request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/:id', {
        preHandler: [requireRole(clinicalRoles)],
        schema: {
            params: idParamSchema,
            body: updateInmunizacionBodySchema,
            response: {
                200: okSchema(inmunizacionDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateInmunizacion(request.user, request.params.id, request.body),
    }));
};
//# sourceMappingURL=inmunizaciones.routes.js.map