# AI Usage Log

[Ler este documento em português](#logs-de-uso-de-ia).

While developing this project, I used OpenAI's Codex tool, with the GPT-6.1 Sol model.

## Project planning and creation

Based on Winnin's briefing document for the Frontend challenge, I considered which architecture and tools would make the most sense for the proposed challenge.

First, I chose to work with Next.js because, in addition to organizing the catalog and detail pages with the App Router, it allowed the first catalog page to be rendered on the server. We adopted this improvement after identifying performance issues in Lighthouse, and it would require additional configuration in a React application using only Vite.

I used TypeScript to make AniList's data contracts explicit and handle fields that might be missing, such as scores, images, and episode counts, more safely than with untyped JavaScript.

To help with styling, I chose Tailwind because of my familiarity with it and the flexibility it offers compared to frameworks that already have prebuilt components, such as Bootstrap.

TanStack Query centralized caching, pagination, and loading and error states, avoiding the need to implement these controls manually with useEffect. It also allowed the catalog to be hydrated with data obtained on the server and episodes and trailers to be loaded separately from the anime details.

Since AniList provides a GraphQL API, I made the queries with fetch, requesting the fields needed for each screen and avoiding adding a client such as Apollo, whose caching features would overlap with those we were already using in React Query.

For testing, I chose Jest because I was already familiar with the tool, and React Testing Library to verify observable behaviors, such as search, error recovery, and keyboard navigation.

Finally, I used Vercel because of its integration with Next.js, which simplified deploying the application with server-side rendering and image optimization, features that static-file-only hosting would not support directly.

## Implementing the first version

After defining the technologies and the initial project organization, I asked Codex to develop a first version of the application using Figma as the visual reference and the data provided by AniList. My intention at that point was to get the main flow working so I could then evaluate the result and guide the adjustments in more detail.

Since I only had read access to Figma, without access to Dev Mode, the reference was viewed through the browser. This made it possible to observe the page composition and guide the implementation, but some typography, color, and spacing details had to be approximated and refined later.

In this first stage, Codex implemented the catalog with anime images, titles, genres, and scores, as well as title search, format filters, and pagination through the load-more button. The GraphQL queries were separated from the interface components, keeping anime-specific logic organized within the catalog feature.

Search was implemented through submission using the button or the Enter key, following the interaction shown in the layout, rather than making a query every time the field changed. This would affect the experience and performance, since multiple backend calls would be made, even if I implemented a debounce. The applied filters were also recorded in the URL, making it possible to share a search and recover its context when navigating through the browser history.

Loading, empty-result, and error states were also included, with the option to retry a failed query. Fields that might be missing from the API received specific handling so the interface would not depend on every anime having an image or score, for example.

Codex created and ran the initial tests and performed browser checks. These checks identified a difference in the API's behavior when receiving optional filters with null values. The query was adjusted to omit filters that were not being used, and a test was updated to cover this case.

## Visual refinement and accessibility

With the first version working, I asked Codex to refine the interface based on Figma. At this stage, the focus was to bring the catalog's presentation closer to the reference by adjusting typography, colors, spacing, and component proportions.

The initial font was replaced with Poppins, chosen for its visual similarity to the reference. Since it was not possible to confirm the font directly through Figma's properties, this choice was an approximation. The files were included in the project and loaded locally, avoiding reliance on a request to Google Fonts.

The card sizes, page margins, spacing between elements, and presentation of titles, genres, and scores were also adjusted. During browser checks, I identified cases where the number of genres caused the content to overlap the score. The cards were changed to allow growth according to their content, while maintaining a minimum height and an area reserved for the score.

Beyond appearance, this stage included improvements for different screen sizes. The catalog was checked at phone, tablet, and desktop widths, and the search and filter controls were adjusted to make touch interaction easier on smaller screens.

With accessibility in mind, the search field's contrast and the visual indication of the focused element were improved. Behaviors such as losing focus in the field after a search and navigation after loading more results or retrying a failed request were also corrected.

Messages were included to communicate changes in the results to assistive technologies, such as loading, the number of available anime, and the absence of results.

## Detail page and expanding the experience

After making the catalog adjustments, I decided the system could have an anime details area in addition to the home page. This goes beyond the challenge's scope and is not included in Figma, but I believe it was a good addition to the system, which by the end of this stage felt like a complete system rather than just a list of cards. I checked that additional information was available in AniList to expand the system's functionality. The idea was to allow users to explore an anime beyond the summary information in its card.

The page was updated to display a banner, cover image, alternative titles, synopsis, and information such as studio, status, dates, episode count, and duration. Since there was no specific reference for this screen in Figma, I followed the catalog's visual identity and adjusted the component organization based on my evaluations of the deliveries.

The cards received links to the detail page, preserving the selected search and format on the way back to the catalog. Loading, error, and title-not-found states were also handled, along with cases where the API did not provide certain information.

While exploring the data, I realized we could create an experience closer to a streaming service. I then created a component that displays episodes with preview images and links to their respective providers, as well as a player with the anime's trailer, when provided by the API. This data represents the links supplied by AniList, without guaranteeing that the list is complete or that the content is available in every region.

## Performance and deployment

After finishing development, I ran a Lighthouse evaluation and realized that performance still needed improvement. I shared the result with Codex and asked for an analysis of the possible causes and the improvements we could make.

The initial evaluation returned a performance score of 44, but there were factors that limited the comparison, such as running in a development environment and a warning about interference from browser extensions. For this reason, this result served as a starting point for investigating the application, without treating all the reported issues as consequences of the code alone.

One improvement was to fetch the first catalog page's data on the server and use it to hydrate React Query. Previously, the browser needed to load the application before starting the anime query. With this change, the initial catalog was rendered with data obtained on the server, while React Query remained responsible for subsequent pages and search and filter interactions.

Adjustments were also made to image and font loading and cache configuration. The goal was to prioritize the initial content and reduce repeated queries when navigating between the catalog and the details, without preventing data updates after the configured freshness period.

After these changes, I ran further checks with the production version. A mobile evaluation performed on the deployed application reached a performance score of 96, with an LCP of 2.7 seconds and no recorded layout shift. Satisfied with the improvement in the application's overall performance, I proceeded with deploying the application on Vercel.

---

# Logs de Uso de IA 

[Read this document in English](#ai-usage-log).

Ao desenvolver esse projeto utilizei a ferramenta Codex, da Open AI, modelo GPT-6.1 Sol 

## Planejamento e criaçao o projeto 

Me baseando no documento de briefing da Winnin para o desafio de Frontend pensei na arquitetura e ferramentas que mais fariam sentido para o desafio proposto. 

Primeiramente, escolhi trabalhar com o Next.js porque, além de organizar o catálogo e as páginas de detalhes com o App Router, ele permitiu renderizar a primeira página do catálogo no servidor, melhoria que adotamos após identificar problemas de desempenho no Lighthouse e que exigiria configuração adicional em uma aplicação React apenas com Vite.

Usei TypeScript para tornar explícitos os contratos dos dados do AniList e tratar campos que podem estar ausentes, como nota, imagem e quantidade de episódios, com mais segurança do que em JavaScript sem tipagem.

Para auxiliar o trabalho de estilização optei pelo Tailwind por familiaridade e tambem pela flexibilidade que ele apresenta em relação a framworks que já possuem seus componentes pré construidos, como o Bootstrap, por exemplo.

O TanStack Query centralizou o cache, a paginação e os estados de carregamento e erro, evitando implementar esses controles manualmente com useEffect. Também permitiu hidratar o catálogo com os dados obtidos no servidor e carregar episódios e trailers separadamente dos detalhes do anime.

Como o AniList oferece uma API GraphQL, fiz as consultas com fetch, solicitando os campos necessários para cada tela e evitando adicionar um cliente como Apollo, cujas funcionalidades de cache se sobreporiam às que já utilizávamos no React Query.

Nos testes, escolhi Jest por já ter familiaridade com a ferramenta, e React Testing Library para verificar comportamentos observáveis, como busca, recuperação de erros e navegação por teclado.

Por fim, utilizei a Vercel pela integração com Next.js, que simplificou a publicação da aplicação com renderização no servidor e otimização de imagens, recursos que uma hospedagem apenas de arquivos estáticos não atenderia diretamente.

## Implementação da primeira versão

Após definir as tecnologias e a organização inicial do projeto, pedi ao Codex que desenvolvesse uma primeira versão da aplicação utilizando o Figma como referência visual e os dados disponibilizados pelo AniList. Minha intenção nesse momento era ter o fluxo principal funcionando para depois avaliar o resultado e orientar os ajustes com mais detalhe.

Como eu tinha apenas acesso de leitura ao Figma, sem acesso ao Dev Mode, a referência foi consultada pelo navegador. Isso permitiu observar a composição da página e orientar a implementação, mas alguns detalhes de tipografia, cores e espaçamentos precisaram ser aproximados e refinados posteriormente.

Nessa primeira etapa, o Codex implementou o catálogo com imagens, títulos, gêneros e notas dos animes, além da busca por título, filtros por formato e paginação pelo botão de carregar mais. As consultas GraphQL foram separadas dos componentes de interface, mantendo a lógica específica dos animes organizada dentro da funcionalidade de catálogo.

A busca foi implementada com envio pelo botão ou pela tecla Enter, seguindo a interação apresentada no layout, em vez de realizar uma consulta a cada alteração do campo, o que impactaria na experiencia e desempenho, já que seriam feitas várias chamadas ao backend, mesmo que implementasse um debounce. Os filtros aplicados também ficaram registrados na URL, permitindo compartilhar uma busca e recuperar o contexto ao navegar pelo histórico do navegador.

Também foram incluídos os estados de carregamento, ausência de resultados e erro, com a possibilidade de tentar novamente uma consulta que falhasse. Os campos que poderiam estar ausentes na API receberam tratamentos específicos para evitar que a interface dependesse de todos os animes terem imagem ou nota, por exemplo.

O Codex criou e executou os testes iniciais e realizou verificações pelo navegador. Essas verificações identificaram uma diferença no comportamento da API ao receber filtros opcionais com valor nulo. A consulta foi ajustada para omitir os filtros que não estavam sendo utilizados, e um teste foi atualizado para cobrir esse caso.

## Refinamento visual e acessibilidade

Com a primeira versão funcionando, pedi ao Codex que refinasse a interface com base no Figma. Nessa etapa, o foco foi aproximar a apresentação do catálogo da referência, ajustando tipografia, cores, espaçamentos e proporções dos componentes.

A fonte inicial foi substituída pela Poppins, escolhida pela semelhança visual com a referência. Como não foi possível confirmar a fonte diretamente pelas propriedades do Figma, essa escolha foi uma aproximação. Os arquivos foram incluídos no projeto e carregados localmente, evitando depender de uma requisição ao Google Fonts.

Também foram ajustados o tamanho dos cards, as margens da página, os espaços entre os elementos e a apresentação dos títulos, gêneros e notas. Durante as verificações pelo navegador, identifiquei casos em que a quantidade de gêneros fazia o conteúdo se sobrepor à nota. Os cards passaram a permitir crescimento conforme o conteúdo, mantendo uma altura mínima e uma área reservada para a pontuação.

Além da aparência, essa etapa incluiu melhorias para diferentes tamanhos de tela. O catálogo foi verificado em larguras de celular, tablet e desktop, e os controles de busca e filtros receberam ajustes para facilitar a interação por toque em telas menores.

Me preocupando com acessibilidade, foram melhorados o contraste do campo de busca e a indicação visual do elemento em foco. Também foram corrigidos comportamentos como a perda de foco no campo após uma busca e a navegação após carregar mais resultados ou tentar novamente uma requisição que falhasse.

Foram incluídas mensagens para comunicar mudanças nos resultados às tecnologias assistivas, como carregamento, quantidade de animes disponíveis e ausência de resultados.

## Página de detalhes e ampliação da experiência

Após executar os ajustes no catálogo, decidi que o sistema poderia ter uma area de detalhes do anime, alem da home page, isso foge ao escopo do desafio e não consta no Figma, porém acredito que foi uma boa adição ao sistema, que ao fim dessa etapa tinha uma cara de sistema completo e não apenas uma listagem de cards. Verifiquei que haviam informações adicionais disponíveis no AniList para expandir as funcionalidades do sistema, a ideia era permitir que o usuário explorasse um anime além das informações resumidas no card.

A página passou a apresentar banner, capa, títulos alternativos, sinopse e informações como estúdio, status, datas, quantidade de episódios e duração. Como não havia uma referência específica dessa tela no Figma, segui a identidade visual do catálogo e ajustei a organização dos componentes conforme minhas avaliações das entregas.

Os cards receberam links para a página de detalhes, preservando a busca e o formato selecionados no caminho de volta ao catálogo. Também foram tratados os estados de carregamento, erro e título não encontrado, além dos casos em que a API não disponibilizava alguma informação.

Ao explorar os dados, percebi que poderíamos criar uma experiência mais próxima de um serviço de streaming. Criei então um componente que exibe os episódios com imagens de prévia e links para os respectivos provedores, além de uma player com o trailer do anime, caso disponibilizado pela API. Esses dados representam os links informados pelo AniList, sem garantir que a lista esteja completa ou que o conteúdo esteja disponível em todas as regiões.

## Desempenho e publicação

Finalizado o desenvolvimento, executei uma avaliação pelo Lighthouse e percebi que o desempenho ainda precisava melhorar. Compartilhei o resultado com o Codex e pedi uma análise das possíveis causas e das melhorias que poderíamos aplicar.

A avaliação inicial apresentou uma nota de desempenho de 44, mas havia fatores que limitavam a comparação, como a execução em ambiente de desenvolvimento e o aviso de interferência de extensões do navegador. Por isso, esse resultado serviu como ponto de partida para investigar a aplicação, sem tratar todos os problemas apontados como consequências exclusivas do código.

Uma das melhorias foi buscar os dados da primeira página do catálogo no servidor e utilizá-los para hidratar o React Query. Antes disso, o navegador precisava carregar a aplicação para depois iniciar a consulta dos animes. Com a alteração, o catálogo inicial passou a ser renderizado com os dados obtidos no servidor, mantendo o React Query responsável pelas próximas páginas e pelas interações de busca e filtros.

Também foram feitos ajustes no carregamento de imagens e fontes e na configuração do cache. O objetivo foi priorizar o conteúdo inicial e reduzir consultas repetidas durante a navegação entre o catálogo e os detalhes, sem impedir a atualização dos dados após o período de validade configurado.

Após essas alterações, executei novas verificações com a versão de produção. Uma avaliação mobile realizada na aplicação publicada atingiu 96 pontos de desempenho, com LCP de 2,7 segundos e sem deslocamento de layout registrado. Satisfeito com a melhora do desempenho geral da aplicação, prossegui com a plublicação da aplicação no Vercel.




