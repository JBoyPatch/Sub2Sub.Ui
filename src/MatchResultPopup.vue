<template>
  <div v-if="open" class="result-modal-backdrop">
    <div class="result-modal">
      <header class="result-modal__header">
        <h2 class="result-modal__title">
          Match Started
        </h2>
      </header>

      <section class="result-modal__body">
        <template v-if="didWin">
          <p class="result-modal__line">
            Congrats, you won the bid for
            <span class="result-modal__highlight">{{ wonRoleName }}</span>!
          </p>
          <p class="result-modal__line">
            The code to enter the lobby is:
          </p>
          <div class="result-modal__code-box">
            <span class="result-modal__code">{{ matchCode }}</span>
          </div>
        </template>

        <template v-else>
          <p class="result-modal__line">
            Sorry, you did not win a bid for any role.
          </p>
          <p class="result-modal__line">
            The bidding is now closed and the match has begun.
          </p>
        </template>
      </section>

      <footer class="result-modal__footer">
        <button class="btn btn--primary" @click="$emit('close')">
          OK
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean;
    didWin: boolean;
    wonRoleName?: string;
    matchCode?: string;
  }>(),
  {
    wonRoleName: '',
    matchCode: ''
  }
);

defineEmits<{
  (e: 'close'): void;
}>();
</script>

<style scoped>
.result-modal-backdrop {
  position: fixed;
  inset: 0;
  background: radial-gradient(circle at top, rgba(15, 23, 42, 0.8), rgba(3, 7, 18, 0.95));
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 60;
}

.result-modal {
  width: min(460px, 95vw);
  border-radius: 8px;
  border: 1px solid #304766;
  box-shadow:
    0 0 0 1px rgba(9, 12, 20, 0.95),
    0 20px 40px rgba(0, 0, 0, 0.85);
  background: radial-gradient(circle at top left, #1b3358 0, #050812 55%, #02040a 100%);
  color: #f5f7ff;
  display: flex;
  flex-direction: column;
}

.result-modal__header {
  padding: 0.6rem 0.9rem;
  background: linear-gradient(to bottom, #1e3148, #071321);
  border-bottom: 1px solid #182336;
  border-radius: 8px 8px 0 0;
  box-shadow: inset 0 1px 0 rgba(214, 234, 255, 0.12);
}

.result-modal__title {
  margin: 0;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.result-modal__body {
  padding: 0.9rem 1rem 0.75rem;
}

.result-modal__line {
  margin: 0 0 0.4rem;
  font-size: 0.9rem;
}

.result-modal__highlight {
  color: #ffb547;
  font-weight: 600;
}

.result-modal__code-box {
  margin-top: 0.4rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  border: 1px solid #3ca9ff;
  background: linear-gradient(to right, #10243a, #071321);
  text-align: center;
}

.result-modal__code {
  font-family: "SF Mono", ui-monospace, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.95rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.result-modal__footer {
  padding: 0.75rem 1rem 0.9rem;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #182336;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(to bottom, #020617, #020814);
}

/* Reuse button look from lobby / bid popup */
.btn {
  padding: 0.45rem 0.9rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.9);
  box-shadow:
    0 2px 0 #132844,
    0 4px 8px rgba(0, 0, 0, 0.7);
  border: 1px solid transparent;
  transition:
    transform 0.05s ease-out,
    box-shadow 0.05s ease-out,
    filter 0.1s ease-out;
}

.btn--primary {
  background: linear-gradient(to bottom, #3f7ac4, #21426f);
  border-color: #1b3b64;
  color: #e5f0ff;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow:
    0 3px 0 #132844,
    0 6px 12px rgba(0, 0, 0, 0.85);
  filter: brightness(1.08);
}

.btn:active {
  transform: translateY(1px);
  box-shadow:
    0 1px 0 #0a1525,
    0 3px 6px rgba(0, 0, 0, 0.9);
}
</style>
