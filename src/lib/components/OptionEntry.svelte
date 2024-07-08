<div>
    <label class="container">
        <slot name="title"></slot>
        <slot name="content"></slot>
        <slot name="suffix"></slot>
    </label>
    <slot name="additional"></slot>
</div>

<style>
    label.container {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
    }

    label.container > * {
        flex: 0 0 auto;
        min-width: 0;
    }
</style>