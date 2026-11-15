import { buildApp } from './app.js';
import { env } from './config/env.js';
async function startServer() {
    const app = await buildApp();
    let isShuttingDown = false;
    const shutdown = async (signal, exitCode = 0) => {
        if (isShuttingDown) {
            return;
        }
        isShuttingDown = true;
        app.log.info({ signal }, 'Iniciando apagado controlado del servidor Fastify...');
        try {
            await app.close();
            app.log.info('Servidor HTTP cerrado correctamente.');
            process.exit(exitCode);
        }
        catch (error) {
            app.log.error({ err: error }, 'Error al cerrar el servidor Fastify.');
            process.exit(1);
        }
    };
    process.on('SIGINT', () => void shutdown('SIGINT', 0));
    process.on('SIGTERM', () => void shutdown('SIGTERM', 0));
    process.on('unhandledRejection', (reason) => {
        app.log.fatal({ err: reason }, 'Promesa rechazada sin capturar');
        void shutdown('unhandledRejection', 1);
    });
    process.on('uncaughtException', (error) => {
        app.log.fatal({ err: error }, 'Excepción no capturada');
        void shutdown('uncaughtException', 1);
    });
    try {
        const address = await app.listen({
            host: env.HOST,
            port: env.PORT,
        });
        app.log.info(`Backend Sistema V escuchando en ${address} [${env.NODE_ENV}]`);
    }
    catch (error) {
        app.log.fatal({ err: error }, 'No fue posible iniciar el servidor HTTP');
        process.exit(1);
    }
}
void startServer();
//# sourceMappingURL=server.js.map