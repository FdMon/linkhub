# Guía de Configuración de Supabase

Sigue estos pasos para crear tu backend gratuito:

1.  **Crear Cuenta**: Ve a [supabase.com](https://supabase.com/) y haz clic en "Start your project". Puedes iniciar sesión con GitHub.
2.  **Nuevo Proyecto**:
    *   Haz clic en "New Project".
    *   Selecciona tu organización (se crea una por defecto).
    *   **Name**: `LinkHub` (o lo que prefieras).
    *   **Database Password**: Genera una segura y guárdala (aunque no la usaremos directamente ahora).
    *   **Region**: Elige la más cercana a ti (ej. Frankfurt o London para Europa).
    *   Haz clic en "Create new project".
3.  **Obtener Credenciales**:
    *   Espera unos minutos a que se configure el proyecto.
    *   Ve al menú lateral izquierdo: **Project Settings** (icono de engranaje) -> **API**.
    *   Aquí encontrarás los datos que necesitamos:
        *   **Project URL**: Algo como `https://xyzxyzxyz.supabase.co`
        *   **Project API keys** -> **anon** / **public**: Una cadena larga de caracteres.

## Personalización de Correos (Emails)

Para que los correos (confirmación, reset password) lleven tu marca y no digan "Supabase":

1.  Ve a tu proyecto en Supabase.
2.  En el menú lateral, ve a **Authentication** -> **Email Templates**.
3.  Aquí puedes editar:
    *   **Confirm Your Email**: El correo de bienvenida/registro.
    *   **Reset Password**: El correo de recuperación.
4.  **Cambios recomendados**:
    *   Cambia el **Subject** a algo como: `Recupera tu contraseña de LinkHub`.
    *   En el **Body**, cambia "Supabase" por "LinkHub".
    *   Puedes usar HTML básico para añadir tu logo o cambiar colores.
5.  **IMPORTANTE**: Asegúrate de mantener la variable `{{ .ConfirmationURL }}` o `{{ .ConfirmationURL }}` (el enlace mágico) en el cuerpo del mensaje, si no, el usuario no podrá hacer clic.

## Base de Datos (Tablas)

Para que funcione el sistema de usuarios, necesitamos crear una tabla en Supabase.

1.  Ve al **SQL Editor** (icono de terminal en la barra lateral).
2.  Pega el siguiente código y dale a **Run**:

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

### 4. Tabla de Enlaces (Links)

Necesitamos una tabla para guardar los enlaces de los usuarios.

1.  Ve al **SQL Editor**.
2.  Ejecuta este código:

```sql
-- Create a table for links
create table links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  url text not null,
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up RLS for links
alter table links enable row level security;

create policy "Public links are viewable by everyone."
  on links for select
  using ( true );

create policy "Users can insert their own links."
  on links for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own links."
  on links for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own links."
  on links for delete
  using ( auth.uid() = user_id );
```

### 5. Configurar Almacenamiento (Storage) para Fotos

Para subir fotos de perfil, necesitamos un "Bucket" en Supabase.

1.  Ve al menú lateral **Storage**.
2.  Haz clic en **"New Bucket"**.
3.  Configúralo así:
    *   **Name**: `avatars`
    *   **Public bucket**: ACTIVADO (Esto es importante para que cualquiera pueda ver la foto).
    *   Dale a "Save".
4.  **Políticas (Policies)**:
    *   Una vez creado, ve a la pestaña **Configuration** -> **Policies**.
    *   En "Other policies" (o bajo el bucket `avatars`), dale a "New Policy" -> "For full customization".
    *   **Policy Name**: `Allow public viewing`
    *   **Allowed operations**: `SELECT`
    *   **Target roles**: `anon`, `authenticated` (o déjalo vacío para todos).
    *   **USING expression**: `true` (Escribe esto en el cuadro de texto).
    *   Dale a "Review" y "Save".
    *   Crea *otra* política para subir fotos:
        *   **Policy Name**: `Allow authenticated uploads`
        *   **Allowed operations**: `INSERT`, `UPDATE`
        *   **Target roles**: `authenticated`
        *   **WITH CHECK expression**: `bucket_id = 'avatars'` (O simplemente `true`).
        *   Dale a "Review" y "Save".

### 3. Automatizar creación de perfil (Triggers)

Para evitar errores de permisos al registrarse, usaremos un "Trigger" que crea el perfil automáticamente cuando se crea el usuario.

1.  Ve al **SQL Editor** en Supabase.
2.  Copia y ejecuta este código:

```sql
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

## Solución de Problemas (Troubleshooting)

### Error: "SecurityError: The request was denied"

Si ves este error al registrarte, significa que **faltan los permisos** (Policies) en la base de datos. Supabase bloquea todo por defecto.

Para arreglarlo, ejecuta este código en el **SQL Editor**:

```sql
-- 1. Habilitar RLS (seguridad)
alter table profiles enable row level security;

-- 2. Permitir que CUALQUIERA vea los perfiles (necesario para comprobar si el usuario existe)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- 3. Permitir que el usuario insert su propio perfil (por si falla el trigger)
drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

-- 4. Permitir que el usuario actualice su propio perfil
drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );
```

## Siguientes Pasos

Una vez tengas estos dos datos (URL y Key), cópialos en el archivo `.env` que he creado en la carpeta del proyecto.
