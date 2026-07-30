# YouX

Projeto de Interação Humano-Computador desenvolvido por **Pedro Gradowski Martins**, estudante de **Análise e Desenvolvimento de Sistemas**.

## Conceito

O YouX é uma plataforma de apoio à rotina acadêmica. A proposta reúne organização de tarefas, sessões de foco e check-ins de energia em uma interface que reduz decisões desnecessárias e mantém o estudante no controle.

O nome combina “You” (você) e “Experience” (experiência): a rotina se adapta ao usuário, e não o contrário.

## Funcionalidades do protótipo

- painel com próxima ação e progresso semanal;
- inclusão e conclusão de tarefas com validação;
- visão semanal por prioridade;
- cronômetro de foco com pausa e reinício;
- check-in de energia;
- painel de insights;
- persistência local no navegador;
- modo de alto contraste, foco visível e suporte a movimento reduzido;
- experiência responsiva para computador e celular.

## Executar

1. Instale as dependências com `npm install`.
2. Inicie o projeto com `npm run dev`.
3. Acesse o endereço exibido no terminal.

Para gerar a versão estática pronta para hospedagem, execute `npm run build`.
Os arquivos finais serão criados na pasta `out/`.

## Privacidade e segurança

Esta versão não envia dados para servidores. As tarefas ficam somente no armazenamento local do navegador. Entradas são limitadas, validadas e renderizadas como texto, sem HTML dinâmico.

## Estrutura da entrega

- `app/`: protótipo funcional;
- `entregaveis/`: relatório e apresentação;
- `.env.example`: referência segura de configuração;
- `TODO.md`: continuidade sugerida do projeto.
