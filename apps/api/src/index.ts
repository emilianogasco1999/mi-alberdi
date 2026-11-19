import { app } from './app.js';
import { envs } from '@config/environment.js';

app.listen(envs.PORT_API, () => {
  console.log(`🚀 [Mi Alberdi API] corriendo en http://localhost:${envs.PORT_API}`);
  console.log(`📚 [Swagger Docs] disponible en http://localhost:${envs.PORT_API}/api-docs`);
});
