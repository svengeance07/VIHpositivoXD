import { z } from 'zod';
import { authenticate, requireRole } from '../auth/index.js';
import { cedulaParamSchema, certificadoDetalleSchema, certificadosQuerySchema, consultaCertificadosCedulaSchema, createCertificadoBodySchema, createReporteBodySchema, idParamSchema, okSchema, reporteDetalleSchema, reportesQuerySchema, updateCertificadoBodySchema, updateReporteBodySchema, validacionCertificadoSchema, } from './reportes.schemas.js';
import { createCertificado, createReporte, getCertificadoById, getCertificadosByCedula, getReporteById, listCertificados, listReportes, updateCertificado, updateReporte, validateCertificadoById, } from './reportes.service.js';
export const certificadosRoutes = async (app) => {
    const typedApp = app.withTypeProvider();
    const clinicalRoles = ['master', 'subregion', 'centro_salud_jefe'];
    // Endpoints públicos de verificación (utilizados por `/consulta`)
    typedApp.get('/publico/validar/:id', {
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(validacionCertificadoSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await validateCertificadoById(request.params.id),
    }));
    typedApp.get('/publico/cedula/:ci', {
        schema: {
            params: cedulaParamSchema,
            response: {
                200: okSchema(consultaCertificadosCedulaSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCertificadosByCedula(request.params.ci),
    }));
    // Endpoints autenticados de consulta y validación
    typedApp.get('/validar/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(validacionCertificadoSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await validateCertificadoById(request.params.id),
    }));
    typedApp.get('/cedula/:ci', {
        preHandler: [authenticate],
        schema: {
            params: cedulaParamSchema,
            response: {
                200: okSchema(consultaCertificadosCedulaSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCertificadosByCedula(request.params.ci),
    }));
    typedApp.get('/', {
        preHandler: [authenticate],
        schema: {
            querystring: certificadosQuerySchema,
            response: {
                200: okSchema(z.array(certificadoDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listCertificados(request.user, request.query),
    }));
    typedApp.get('/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(certificadoDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getCertificadoById(request.params.id),
    }));
    typedApp.post('/', {
        preHandler: [requireRole(clinicalRoles)],
        schema: {
            body: createCertificadoBodySchema,
            response: {
                201: okSchema(certificadoDetalleSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createCertificado(request.user, request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/:id', {
        preHandler: [requireRole('master', 'subregion')],
        schema: {
            params: idParamSchema,
            body: updateCertificadoBodySchema,
            response: {
                200: okSchema(certificadoDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateCertificado(request.user, request.params.id, request.body),
    }));
};
export const reportesRoutes = async (app) => {
    const typedApp = app.withTypeProvider();
    const clinicalRoles = ['master', 'subregion', 'centro_salud_jefe'];
    await typedApp.register(certificadosRoutes, { prefix: '/certificados' });
    typedApp.get('/', {
        preHandler: [authenticate],
        schema: {
            querystring: reportesQuerySchema,
            response: {
                200: okSchema(z.array(reporteDetalleSchema)),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await listReportes(request.user, request.query),
    }));
    typedApp.get('/:id', {
        preHandler: [authenticate],
        schema: {
            params: idParamSchema,
            response: {
                200: okSchema(reporteDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await getReporteById(request.user, request.params.id),
    }));
    typedApp.post('/', {
        preHandler: [requireRole(clinicalRoles)],
        schema: {
            body: createReporteBodySchema,
            response: {
                201: okSchema(reporteDetalleSchema),
            },
        },
    }, async (request, reply) => {
        const created = await createReporte(request.user, request.body);
        return reply.status(201).send({
            ok: true,
            data: created,
        });
    });
    typedApp.patch('/:id', {
        preHandler: [requireRole(clinicalRoles)],
        schema: {
            params: idParamSchema,
            body: updateReporteBodySchema,
            response: {
                200: okSchema(reporteDetalleSchema),
            },
        },
    }, async (request) => ({
        ok: true,
        data: await updateReporte(request.user, request.params.id, request.body),
    }));
};
//# sourceMappingURL=reportes.routes.js.map