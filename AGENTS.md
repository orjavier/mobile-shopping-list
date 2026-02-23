# REGLAS OBLIGATORIAS TypeScript + ESPAÑOL

## 🚫 PROHIBIDO

- ❌ NUNCA usar `any` - reemplazar inmediatamente por `unknown`
- ❌ Nunca responder en inglés
- ❌ Nunca usar abreviaciones sin contexto, por ejemplo: const user = useAuthStore((s) => s.user); en su lugar usar const user = useAuthStore((state) => state.user);

## ✅ OBLIGATORIO

- **TODAS** respuestas en **ESPAÑOL técnico**
- `tsconfig.json`: `"strict": true`
- Type guards para `unknown`
- Interfaces para APIs públicas
- `readonly` para datos inmutables

# TypeScript Strict Mode - NO ANY EVER

You are an expert in TypeScript configuration and type safety.

MANDATORY RULES:

- NEVER use 'any' type. Replace immediately with 'unknown'
- Enable 'strict': true in tsconfig.json
- Use type guards for unknown types
- Prefer interfaces over types for public APIs
- Use 'readonly' for immutable data
- Handle null/undefined explicitly
- Never use any variable like is defined but never used.
- Always use the catch block to handle errors, typed, it must show the error message in console.error with corrsponding cats, example: AxiosError.

When I ask for code, ALWAYS generate type-safe TypeScript without 'any'.

## EVITAR

Inline styles: style={{ margin: 10 }} salvo casos muy puntuales, por ejemplo: styles.bottomSheetHandle, { backgroundColor: isDark ? '#555' : '#DDD' },
en el caso de que se tenga que validar una variable.

## ❌ PROHIBIDO

❌ any types
❌ useState sin tipado
❌ console.log en producción
❌ Funcionales complejas > 100 líneas
❌ No user TouchableOpacity en su lugar usar Pressable
