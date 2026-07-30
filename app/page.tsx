"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type View = "inicio" | "semana" | "foco" | "insights";
type Energy = "Baixa" | "Estável" | "Alta";
type TaskStatus = "pending" | "done";

type Task = {
  id: string;
  title: string;
  course: string;
  due: string;
  status: TaskStatus;
};

const STORAGE_KEY = "youx.tasks.v1";
const COURSE_OPTIONS = [
  "Interação Humano-Computador",
  "Engenharia de Software",
  "Banco de Dados",
  "Desenvolvimento Web",
] as const;

const starterTasks: Task[] = [
  {
    id: "ihc-prototipo",
    title: "Finalizar protótipo navegável",
    course: "Interação Humano-Computador",
    due: "Hoje, 20:00",
    status: "pending",
  },
  {
    id: "bd-modelagem",
    title: "Revisar modelo entidade-relacionamento",
    course: "Banco de Dados",
    due: "Amanhã, 18:30",
    status: "pending",
  },
  {
    id: "web-componentes",
    title: "Praticar componentes responsivos",
    course: "Desenvolvimento Web",
    due: "Sexta, 19:00",
    status: "done",
  },
];

const navItems: Array<{ id: View; label: string; shortLabel: string; icon: string }> = [
  { id: "inicio", label: "Início", shortLabel: "Início", icon: "⌂" },
  { id: "semana", label: "Minha semana", shortLabel: "Semana", icon: "□" },
  { id: "foco", label: "Modo foco", shortLabel: "Foco", icon: "◉" },
  { id: "insights", label: "Insights", shortLabel: "Insights", icon: "↗" },
];

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    candidate.title.length >= 3 &&
    candidate.title.length <= 80 &&
    typeof candidate.course === "string" &&
    typeof candidate.due === "string" &&
    (candidate.status === "pending" || candidate.status === "done")
  );
}

function loadStoredTasks(): Task[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return starterTasks;
    const parsed: unknown = JSON.parse(stored);
    if (!Array.isArray(parsed)) return starterTasks;
    const safeTasks = parsed.filter(isTask).slice(0, 30);
    return safeTasks.length > 0 ? safeTasks : starterTasks;
  } catch {
    return starterTasks;
  }
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function Home() {
  const [view, setView] = useState<View>("inicio");
  const [tasks, setTasks] = useState<Task[]>(starterTasks);
  const [energy, setEnergy] = useState<Energy>("Estável");
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCourse, setTaskCourse] = useState<string>(COURSE_OPTIONS[0]);
  const [taskDue, setTaskDue] = useState("Hoje, 21:00");
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [todayLabel, setTodayLabel] = useState("Sua rotina de hoje");
  const [highContrast, setHighContrast] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTasks(loadStoredTasks());
      const date = new Intl.DateTimeFormat("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      }).format(new Date());
      setTodayLabel(date.charAt(0).toUpperCase() + date.slice(1));
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // O protótipo continua funcional mesmo se o navegador bloquear armazenamento local.
    }
  }, [tasks]);

  useEffect(() => {
    if (!timerRunning) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          setToast("Sessão concluída. Hora de fazer uma pausa.");
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [timerRunning]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (isTaskFormOpen) titleInputRef.current?.focus();
  }, [isTaskFormOpen]);

  const completedTasks = tasks.filter((task) => task.status === "done").length;
  const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);
  const pendingTasks = useMemo(
    () => tasks.filter((task) => task.status === "pending"),
    [tasks],
  );

  function changeView(nextView: View) {
    setView(nextView);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleTask(taskId: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "done" ? "pending" : "done" }
          : task,
      ),
    );
    setToast("Progresso atualizado.");
  }

  function openTaskForm() {
    setFormError("");
    setIsTaskFormOpen(true);
  }

  function closeTaskForm() {
    setIsTaskFormOpen(false);
    setFormError("");
  }

  function handleAddTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const safeTitle = taskTitle.trim().replace(/\s+/g, " ");
    const safeDue = taskDue.trim().replace(/\s+/g, " ");

    if (safeTitle.length < 3 || safeTitle.length > 80) {
      setFormError("Use um título entre 3 e 80 caracteres.");
      return;
    }
    if (!COURSE_OPTIONS.includes(taskCourse as (typeof COURSE_OPTIONS)[number])) {
      setFormError("Selecione uma disciplina válida.");
      return;
    }
    if (safeDue.length < 3 || safeDue.length > 30) {
      setFormError("Informe um prazo curto e claro.");
      return;
    }

    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: safeTitle,
      course: taskCourse,
      due: safeDue,
      status: "pending",
    };
    setTasks((current) => [newTask, ...current].slice(0, 30));
    setTaskTitle("");
    setTaskDue("Hoje, 21:00");
    closeTaskForm();
    setToast("Tarefa adicionada à sua rotina.");
  }

  function resetTimer() {
    setTimerRunning(false);
    setSecondsLeft(25 * 60);
  }

  // TODO: substituir o armazenamento local por uma API autenticada quando o protótipo
  // evoluir para produto, mantendo validação no servidor e coleta mínima de dados.

  return (
    <main className={highContrast ? "app-shell high-contrast" : "app-shell"}>
      <a className="skip-link" href="#main-content">
        Ir para o conteúdo principal
      </a>

      <aside className="sidebar" aria-label="Navegação principal">
        <button className="brand" onClick={() => changeView("inicio")} aria-label="YouX, ir ao início">
          <span className="brand-mark" aria-hidden="true">
            YX
          </span>
          <span className="brand-name">YouX</span>
        </button>

        <nav className="side-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={view === item.id ? "nav-item active" : "nav-item"}
              onClick={() => changeView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <section className="profile-card" aria-label="Perfil">
          <span className="avatar" aria-hidden="true">
            PG
          </span>
          <span>
            <strong>Pedro</strong>
            <small>Curso • ADS</small>
          </span>
          <button
            className="icon-button"
            aria-label={highContrast ? "Desativar alto contraste" : "Ativar alto contraste"}
            onClick={() => setHighContrast((current) => !current)}
            title="Alternar contraste"
          >
            ◐
          </button>
        </section>
      </aside>

      <section className="content" id="main-content" tabIndex={-1}>
        <header className="topbar">
          <div>
            <p className="eyebrow">{todayLabel}</p>
            <h1>
              {view === "inicio" && "Olá, Pedro."}
              {view === "semana" && "Sua semana, sem ruído."}
              {view === "foco" && "Uma coisa de cada vez."}
              {view === "insights" && "Seu ritmo em perspectiva."}
            </h1>
          </div>
          <button className="primary-button" onClick={openTaskForm}>
            <span aria-hidden="true">＋</span> Nova tarefa
          </button>
        </header>

        {view === "inicio" && (
          <div className="view-stack">
            <section className="hero-card" aria-labelledby="next-step-title">
              <div className="hero-copy">
                <span className="status-chip">Próximo passo</span>
                <p className="hero-course">Interação Humano-Computador</p>
                <h2 id="next-step-title">Finalizar o fluxo principal do protótipo</h2>
                <p>
                  Você reservou este bloco para hoje. Comece com uma sessão curta
                  e avance sem precisar decidir o que fazer agora.
                </p>
                <div className="hero-actions">
                  <button className="dark-button" onClick={() => changeView("foco")}>
                    Iniciar foco
                  </button>
                  <span>25 min • prioridade alta</span>
                </div>
              </div>
              <div className="focus-orbit" aria-label={`Progresso semanal: ${progress}%`}>
                <div className="orbit-ring" style={{ "--progress": `${progress * 3.6}deg` } as React.CSSProperties}>
                  <span>
                    <strong>{progress}%</strong>
                    <small>da semana</small>
                  </span>
                </div>
              </div>
            </section>

            <div className="dashboard-grid">
              <section className="panel tasks-panel" aria-labelledby="today-title">
                <div className="panel-heading">
                  <div>
                    <p className="eyebrow">Prioridades</p>
                    <h2 id="today-title">Para hoje</h2>
                  </div>
                  <span className="count-label">{pendingTasks.length} pendentes</span>
                </div>
                <div className="task-list">
                  {tasks.slice(0, 4).map((task) => (
                    <article className={task.status === "done" ? "task done" : "task"} key={task.id}>
                      <button
                        className="check-button"
                        onClick={() => toggleTask(task.id)}
                        aria-label={
                          task.status === "done"
                            ? `Marcar ${task.title} como pendente`
                            : `Concluir ${task.title}`
                        }
                        aria-pressed={task.status === "done"}
                      >
                        {task.status === "done" ? "✓" : ""}
                      </button>
                      <div>
                        <h3>{task.title}</h3>
                        <p>{task.course}</p>
                      </div>
                      <time>{task.due}</time>
                    </article>
                  ))}
                </div>
                <button className="text-button" onClick={() => changeView("semana")}>
                  Ver semana completa <span aria-hidden="true">→</span>
                </button>
              </section>

              <div className="right-rail">
                <section className="panel energy-panel" aria-labelledby="energy-title">
                  <p className="eyebrow">Check-in rápido</p>
                  <h2 id="energy-title">Como está sua energia?</h2>
                  <div className="energy-options" role="group" aria-label="Nível de energia">
                    {(["Baixa", "Estável", "Alta"] as Energy[]).map((level) => (
                      <button
                        key={level}
                        className={energy === level ? "energy-button selected" : "energy-button"}
                        onClick={() => {
                          setEnergy(level);
                          setToast(`Energia registrada como ${level.toLowerCase()}.`);
                        }}
                        aria-pressed={energy === level}
                      >
                        <span aria-hidden="true">
                          {level === "Baixa" ? "◔" : level === "Estável" ? "◑" : "●"}
                        </span>
                        {level}
                      </button>
                    ))}
                  </div>
                  <p className="helper-text">
                    A sugestão de ritmo se adapta ao que você informa.
                  </p>
                </section>

                <section className="mini-panel" aria-label="Resumo de foco">
                  <div className="mini-illustration" aria-hidden="true">
                    <span className="mini-dot one" />
                    <span className="mini-dot two" />
                    <span className="mini-line" />
                    <strong>42</strong>
                  </div>
                  <div>
                    <p className="eyebrow">Foco nesta semana</p>
                    <h2>3h 42min</h2>
                    <span className="positive">↑ 18% no seu ritmo</span>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}

        {view === "semana" && (
          <section className="week-layout">
            <div className="week-summary">
              <p className="eyebrow">Visão semanal</p>
              <h2>Quatro dias para avançar com calma.</h2>
              <p>
                Os blocos foram distribuídos por prioridade. Concluir uma tarefa
                atualiza seu progresso imediatamente.
              </p>
              <div className="week-progress" aria-label={`${progress}% das tarefas concluídas`}>
                <span style={{ width: `${progress}%` }} />
              </div>
              <strong>{completedTasks} de {tasks.length} concluídas</strong>
            </div>
            <div className="day-columns">
              {["Hoje", "Amanhã", "Sexta", "Próxima semana"].map((day, dayIndex) => (
                <section className="day-column" key={day}>
                  <div className="day-heading">
                    <span>{String(dayIndex + 30).padStart(2, "0")}</span>
                    <h3>{day}</h3>
                  </div>
                  {tasks
                    .filter((_, taskIndex) => taskIndex % 4 === dayIndex)
                    .map((task) => (
                      <button
                        className={task.status === "done" ? "week-task done" : "week-task"}
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                      >
                        <span>{task.course}</span>
                        <strong>{task.title}</strong>
                        <small>{task.due}</small>
                      </button>
                    ))}
                  {tasks.filter((_, taskIndex) => taskIndex % 4 === dayIndex).length === 0 && (
                    <p className="empty-day">Espaço livre para respirar.</p>
                  )}
                </section>
              ))}
            </div>
          </section>
        )}

        {view === "foco" && (
          <section className="focus-view">
            <div className="focus-main">
              <p className="eyebrow">Sessão atual</p>
              <h2>Finalizar o fluxo principal do protótipo</h2>
              <p className="focus-course">Interação Humano-Computador</p>
              <div
                className="timer"
                aria-live="off"
                aria-label={`${Math.ceil(secondsLeft / 60)} minutos restantes`}
              >
                {formatTime(secondsLeft)}
              </div>
              <div className="timer-actions">
                <button
                  className="dark-button"
                  onClick={() => {
                    if (secondsLeft === 0) setSecondsLeft(25 * 60);
                    setTimerRunning((current) => !current);
                  }}
                >
                  {timerRunning ? "Pausar" : "Começar"}
                </button>
                <button className="secondary-button" onClick={resetTimer}>
                  Reiniciar
                </button>
              </div>
              <p className="timer-note">
                As notificações ficam em silêncio durante a sessão.
              </p>
            </div>
            <aside className="focus-side">
              <p className="eyebrow">Antes de começar</p>
              <ol>
                <li>Feche abas que não fazem parte desta tarefa.</li>
                <li>Deixe água por perto.</li>
                <li>Ao terminar, registre o próximo passo.</li>
              </ol>
              <div className="privacy-note">
                <strong>Seu tempo é seu.</strong>
                <p>Os dados desta demonstração ficam somente neste navegador.</p>
              </div>
            </aside>
          </section>
        )}

        {view === "insights" && (
          <section className="insights-layout">
            <div className="insight-intro">
              <p className="eyebrow">Últimos 7 dias</p>
              <h2>Seu melhor ritmo acontece no começo da noite.</h2>
              <p>
                Você manteve constância sem ultrapassar duas sessões seguidas.
                Isso ajuda a equilibrar progresso e descanso.
              </p>
            </div>
            <section className="chart-panel" aria-labelledby="chart-title">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Tempo concentrado</p>
                  <h2 id="chart-title">3h 42min</h2>
                </div>
                <span className="positive">+34 min</span>
              </div>
              <div className="bar-chart" role="img" aria-label="Gráfico: minutos de foco de segunda a domingo">
                {[38, 54, 28, 64, 46, 72, 35].map((height, index) => (
                  <div className="bar-column" key={index}>
                    <span style={{ height: `${height}%` }} className={index === 5 ? "peak" : ""} />
                    <small>{["S", "T", "Q", "Q", "S", "S", "D"][index]}</small>
                  </div>
                ))}
              </div>
            </section>
            <div className="insight-metrics">
              <article>
                <span>01</span>
                <p>Melhor faixa</p>
                <strong>18h–20h</strong>
              </article>
              <article>
                <span>02</span>
                <p>Sequência atual</p>
                <strong>4 dias</strong>
              </article>
              <article>
                <span>03</span>
                <p>Pausa média</p>
                <strong>8 min</strong>
              </article>
            </div>
          </section>
        )}
      </section>

      <nav className="bottom-nav" aria-label="Navegação móvel">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? "active" : ""}
            onClick={() => changeView(item.id)}
            aria-current={view === item.id ? "page" : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.shortLabel}
          </button>
        ))}
      </nav>

      {isTaskFormOpen && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTaskForm();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeTaskForm();
          }}
        >
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-form-title"
          >
            <div className="modal-heading">
              <div>
                <p className="eyebrow">Organizar rotina</p>
                <h2 id="task-form-title">Nova tarefa</h2>
              </div>
              <button className="close-button" onClick={closeTaskForm} aria-label="Fechar">
                ×
              </button>
            </div>
            <form onSubmit={handleAddTask} noValidate>
              <label htmlFor="task-title">O que precisa ser feito?</label>
              <input
                ref={titleInputRef}
                id="task-title"
                value={taskTitle}
                onChange={(event) => setTaskTitle(event.target.value)}
                maxLength={80}
                autoComplete="off"
                aria-describedby={formError ? "form-error" : undefined}
              />
              <label htmlFor="task-course">Disciplina</label>
              <select
                id="task-course"
                value={taskCourse}
                onChange={(event) => setTaskCourse(event.target.value)}
              >
                {COURSE_OPTIONS.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
              <label htmlFor="task-due">Prazo</label>
              <input
                id="task-due"
                value={taskDue}
                onChange={(event) => setTaskDue(event.target.value)}
                maxLength={30}
                autoComplete="off"
              />
              {formError && (
                <p className="form-error" id="form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={closeTaskForm}>
                  Cancelar
                </button>
                <button type="submit" className="dark-button">
                  Adicionar
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <span aria-hidden="true">✓</span>
          {toast}
        </div>
      )}
    </main>
  );
}
