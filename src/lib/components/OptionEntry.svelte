<script lang="ts">
    export let title = "title";
    export let noBorder = false;
</script>

<div>
    <label class="container" class:noBorder>
        <span class="label-text">{title}: </span>
        <div class="content">
            <slot name="content"></slot>
        </div>
        <slot name="suffix"></slot>
    </label>
    <div class="additional">
        <slot name="additional"></slot>
    </div>
</div>

<style>
    label.container {
        display: inline-flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 0.5rem;
        width: 100%;
        border-top: 1px solid var(--background-300);
    }
    label.container.noBorder {
        border-top: none;
    }

    label.container > * {
        flex: 0 0 auto;
        min-width: 0;
    }

    span.label-text {
        font-weight: bold;
        display: inline-block;
        text-align: right;
        min-width: 30%;
    }

    div.content {
        flex: 0 1 auto;
        max-width: 60%;
        display: flex;
        align-items: center;
    }

    div.additional {
        margin-left: 30%;
    }
</style>