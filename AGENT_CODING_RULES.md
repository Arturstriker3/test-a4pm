# Coding Rules & Project Specs – RG Receitas Culinárias (Tech Lead)

## Objetivo

Implementar o máximo de funcionalidades descritas abaixo, seguindo as restrições e diferenciais obrigatórios para nível Tech Lead.

## Funcionalidades Obrigatórias

- Cadastro de usuário no sistema
- Login de usuário
- Logoff de usuário
- Cadastro de receitas pelo usuário
- Pesquisa de receitas cadastradas pelo usuário
- Edição de uma receita
- Exclusão de uma receita
- Impressão de uma receita

## Banco de Dados

O banco de dados deve ser MariaDB. Os scripts e modelagem estão na pasta `database`.

## Restrições

- Backend: Node.js com TypeScript, API RESTful
- Frontend: Vue.js, interface comunicando com backend
- Banco de dados: MySQL
- Guia detalhado explicando como rodar o sistema

## Diferenciais (Obrigatórios para Tech Lead)

- Documentação da API com Swagger
- Uso de Docker
- Testes unitários e de integração (E2E)

## Gerenciador de Pacotes

O projeto utiliza pnpm como gerenciador de pacotes padrão para backend e frontend.

## Estrutura de Projeto

O backend deve ser organizado seguindo o padrão de módulos e separação de responsabilidades inspirado no NestJS (pasta src, módulos, controllers, services, etc).

## Coding Rules

1. Se uma alteração proposta exceder 300 linhas de código, primeiro sugira as ideias e explique antes de implementar.
2. Não gere comentários no código, exceto se solicitado no padrão de args (Argumentos).
   - Exemplo: `// @args { "name": "string", "age": "number" }`
   - Isso ajuda a manter o código limpo e focado na lógica.
3. Use boas práticas de engenharia de software e código limpo.
4. Use nomes e termos em inglês por padrão.
5. Sugestões de melhorias são bem-vindas.
6. Todas as queries SQL devem ser pensadas e implementadas visando a melhor performance possível (uso de índices, joins eficientes, evitar N+1, etc).
7. Verifique se o código está funcionando corretamente antes de enviar a sugestão e se já existe uma implementação similar, não gere código duplicado.
8. Utilize o padrão de erros e exceções definido no arquivo `app-exceptions.ts` para tratamento de erros.
9. Utilize o padrão de validação de DTOs definido no arquivo `validation.service.ts` para validação de dados de entrada.
10. Utilize o padrão de autenticação e autorização definido no arquivo `auth.service.ts` para proteger rotas sensíveis.

## Roadmap Sugerido

1. **Project Setup**
   - Inicializar repositório e ambiente Node.js/TypeScript
   - Instalar dependências do backend e frontend
2. **Banco de Dados** ✅

   - Banco MariaDB implementado e scripts já configurados na pasta `database`
3. **API REST**
   - Implementar endpoints para autenticação e CRUD de receitas
   - Documentar com Swagger
4. **Frontend**
   - Criar interface com Vue.js
   - Integrar com a API
5. **Testes**
   - Implementar testes unitários e E2E
6. **Docker**
   - Adicionar arquivos de configuração para facilitar o deploy

Sinta-se livre para adaptar ou expandir conforme necessário.
