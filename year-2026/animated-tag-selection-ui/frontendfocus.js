const tags = document.querySelectorAll('button');
    const search = document.querySelector('.search');
    const tagsContainer = document.querySelector('.tags');

    tags.forEach((tag, index) => {
      tag.style.viewTransitionName = `tag-${index}`;
      tag.style.order = index;
    });

    tagsContainer.addEventListener('click', (e) => {
      const tag = e.target.closest('button');
      if (!tag) return;

      document.startViewTransition(() => {
        search.appendChild(tag);
      });
    });

    search.addEventListener('click', (e) => {
      const span = e.target.closest('span');
      if (!span) return;

      const tag = span.closest('button');
      document.startViewTransition(() => {
        tagsContainer.appendChild(tag);
      });
    });