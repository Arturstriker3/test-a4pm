# Sistema de Migrations

Este projeto inclui um sistema completo de migrations inspirado no TypeORM, mas sem usar um ORM.

## Características

- ✅ Tabela `migrations` para controle de estado
- ✅ Arquivos TypeScript para migrations
- ✅ Execução automática na inicialização do servidor
- ✅ Suporte a rollback
- ✅ Controle transacional (rollback automático em caso de erro)
- ✅ CLI para gerenciamento manual

## Comandos Disponíveis

### Executar migrations pendentes

```bash
pnpm migration:run
```

### Fazer rollback da última migration

```bash
pnpm migration:rollback
```

### Ver status das migrations

```bash
pnpm migration:status
```

### Criar nova migration

```bash
pnpm migration:create nome_da_migration
```

## Como Usar

### 1. Criar uma nova migration

```bash
pnpm migration:create add_new_column_to_users
```

### 2. Editar o arquivo gerado

O arquivo será criado em `src/migrations/files/` com timestamp. Exemplo:

```typescript
import { Connection } from "mysql2/promise";
import { Migration } from "../Migration.interface";

const migration: Migration = {
  name: "1754196866198_add_new_column_to_users",
  timestamp: 1754196866198,

  async up(connection: Connection): Promise<void> {
    await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      ADD COLUMN new_column VARCHAR(255) NULL;
    `);
  },

  async down(connection: Connection): Promise<void> {
    await connection.execute(`
      ALTER TABLE teste_receitas_rg_sistemas.usuarios 
      DROP COLUMN new_column;
    `);
  },
};

export default migration;
```

### 3. Executar as migrations

As migrations são executadas automaticamente quando o servidor inicia, ou você pode executar manualmente:

```bash
pnpm migration:run
```

### 4. Verificar status

```bash
pnpm migration:status
```

## Estrutura do Projeto

```
server/src/migrations/
├── Migration.interface.ts       # Interface da migration
├── MigrationRunner.ts          # Classe principal de gerenciamento
├── cli.ts                      # CLI para comandos manuais
└── files/                      # Pasta onde ficam as migrations
    └── 1754196866198_add_recovery_token_to_users.migration.ts
```

## Migrations Disponíveis

- `1754196866198_add_recovery_token_to_users` - Adiciona campos para recovery token na tabela de usuários

## Boas Práticas

1. **Sempre teste o rollback**: Certifique-se de que o método `down()` funciona corretamente
2. **Use transações**: O sistema já gerencia transações automaticamente
3. **Nomes descritivos**: Use nomes claros para as migrations
4. **Backup antes de produção**: Sempre faça backup antes de aplicar migrations em produção
5. **Teste em ambiente de desenvolvimento**: Execute as migrations em dev/staging antes de produção

## Estrutura do Banco

O sistema cria automaticamente a tabela `migrations`:

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  timestamp BIGINT NOT NULL,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timestamp (timestamp),
  INDEX idx_name (name)
);
```

## Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=teste_receitas_rg_sistemas
```
