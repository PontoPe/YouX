# YouX

Projeto de Interação Humano-Computador desenvolvido por **Pedro Gradowski Martins**, estudante de **Análise e Desenvolvimento de Sistemas**.

## Conceito

O YouX ajuda estudantes a organizar tarefas, estudar em blocos de foco e acompanhar a semana sem deixar a tela carregada.

O nome combina “You” (você) e “Experience” (experiência): a rotina se adapta ao usuário, e não o contrário.

## Acesso

O protótipo está disponível em [pontope.github.io/YouX](https://pontope.github.io/YouX/).

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
- `.github/workflows/`: publicação automática no GitHub Pages;
- `.env.example`: referência segura de configuração;
- `TODO.md`: continuidade sugerida do projeto.
