import '../tailwind.css';

import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { bind } from '@react-rxjs/core';
import clsx from 'clsx';
import React, { ComponentProps, Fragment, useState } from 'react';
import { ajax } from 'rxjs/ajax';

import { ApplicationState, BuildModel } from '../../shared/exports';
import { createWebsocketUrl, useStatus } from '../utils/status';
import Collapsible from './Collapsible';
import Logo from './Logo';
import SimpleLog from './SimpleLog';

const clean$ = ajax({
  url: '/___status/clean',
  method: 'POST',
});

const build$ = ajax({
  url: '/___status/build',
  method: 'POST',
});

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="17"
      fill="currentColor"
      className={clsx('inline transition', { 'rotate-180': open })}
      viewBox="0 0 16 16"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}

function History({
  historyItems,
}: {
  historyItems: Array<{
    id: number;
    startedAt: number;
    finishedAt: number;
    success: boolean;
    type: string;
  }>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-line">
        <thead>
          <tr>
            {['Id', 'Type', 'Date', 'Status', 'Log'].map((label) => (
              <th
                key={label}
                scope="col"
                className="whitespace-nowrap px-3 py-4 text-left text-xs font-medium uppercase tracking-wider text-muted first:pl-0"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {historyItems.map((item) => {
            const date = new Date();

            const startedAtDate = date.setTime(item.startedAt);
            // Passing undefined uses the runtime's default locale.
            // window.navigator.language can be empty or non-standard, which
            // makes toLocaleString throw.
            const convertedDate = new Date(startedAtDate).toLocaleString(
              undefined,
              {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZoneName: 'short',
              },
            );

            return (
              <Disclosure key={item.id}>
                {({ open }) => (
                  <>
                    <tr>
                      <td className="whitespace-nowrap py-4 pr-3 text-sm tabular-nums">
                        {item.id}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm capitalize">
                        {item.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-muted">
                        {convertedDate},{' '}
                        {Math.round((item.finishedAt - item.startedAt) / 1000)}{' '}
                        sec{' '}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium leading-5',
                            {
                              // Lagoon Aqua is too light to carry text, so the
                              // success badge tints it and uses Delta Blue ink.
                              'bg-success/20 text-shell': item.success == true,
                              'bg-error/10 text-error': item.success == false,
                            },
                          )}
                        >
                          {item.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <Disclosure.Button
                          className="cursor-pointer text-link transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-link"
                          aria-label={`Toggle the log of build ${item.id}`}
                        >
                          <Chevron open={open} />
                        </Disclosure.Button>
                      </td>
                    </tr>
                    <tr className="!border-0">
                      <td colSpan={5} className="pre-container !border-0 p-0">
                        <Collapsible
                          show={open}
                          delay={0}
                          fadeDuration={200}
                          scaleDuration={250}
                        >
                          <Disclosure.Panel>
                            <HistoryLogs id={item.id} />
                          </Disclosure.Panel>
                        </Collapsible>
                      </td>
                    </tr>
                  </>
                )}
              </Disclosure>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const [useHistoryItem] = bind(
  (id: number) =>
    ajax.getJSON<BuildModel | undefined>(`/___status/history/${id}`),
  undefined,
);

function HistoryLogs(props: { id: number }) {
  const value = useHistoryItem(props.id);
  return (
    <div>
      <pre>{value ? value.logs : 'Loading...'}</pre>
    </div>
  );
}

function CleanButton() {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button className={'button-secondary'} onClick={openModal}>
        Clean
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-shell/60" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-card p-6 text-left align-middle shadow-xl transition-all">
                  <p className="text-sm text-muted">
                    Please confirm that you definitely want to clean the build:
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      className="button-primary"
                      onClick={closeModal}
                    >
                      No, go back!
                    </button>
                    <button
                      className={'button-secondary'}
                      onClick={() => {
                        clean$.subscribe();
                        closeModal();
                      }}
                    >
                      Yes, do it!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function BuildButton() {
  return (
    <button className={'button-primary'} onClick={() => build$.subscribe()}>
      Queue Build
    </button>
  );
}

export function AppStatus() {
  const labels: { [Property in ApplicationState]: string } = {
    [ApplicationState.Error]: 'Error',
    [ApplicationState.Ready]: 'Ready',
    [ApplicationState.Starting]: 'Starting',
    [ApplicationState.Fatal]: 'Fatal',
    [ApplicationState.Updating]: 'Updating',
  };
  const status = useStatus();
  return (
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className={clsx('size-2 shrink-0 rounded-full', {
          'bg-success': status === ApplicationState.Ready,
          'bg-accent':
            status === ApplicationState.Starting ||
            status === ApplicationState.Updating,
          'bg-error':
            status === ApplicationState.Error ||
            status === ApplicationState.Fatal,
          'bg-muted': !status,
        })}
      />
      Status: {status ? labels[status] : 'Unknown'}
    </span>
  );
}

function scrollToBuildHistory() {
  const target = document.getElementById('build-history');
  target?.scrollIntoView({ behavior: 'smooth' });
}

function Card({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={clsx(
        'rounded-xl border border-line bg-card p-4 shadow-sm md:p-6',
        className,
      )}
    >
      {children}
    </section>
  );
}

export default function Info({
  historyItems,
  isStorybook,
}: {
  historyItems: ComponentProps<typeof History>['historyItems'];
  isStorybook?: boolean;
}) {
  const logsSocket = isStorybook
    ? '__storybook__'
    : createWebsocketUrl('/___status/logs');
  return (
    <div className="min-h-screen bg-surface text-ink">
      <header className="bg-shell">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 md:px-6 lg:px-10 xl:px-14">
          <div className="flex items-center gap-4">
            <Logo className="w-32 text-white md:w-40" />
            <span className="border-l border-lunar/40 pl-4 text-sm font-medium uppercase tracking-widest text-white">
              Publisher
            </span>
          </div>
          <h3 className="text-sm text-lunar">
            <AppStatus />
          </h3>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10 lg:px-10 xl:px-14">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <BuildButton />
            <CleanButton />
          </div>
          <a
            onClick={scrollToBuildHistory}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-sm font-medium text-link transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-link"
          >
            Build History
            <svg
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
              />
            </svg>
          </a>
        </div>

        <Disclosure defaultOpen>
          {({ open }) => (
            <Card className="mb-8">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                  Logs
                </h2>
                <Disclosure.Button
                  aria-label="Toggle logs"
                  className="shrink-0 cursor-pointer text-link transition hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-link"
                >
                  <Chevron open={open} />
                </Disclosure.Button>
              </div>

              <Collapsible
                show={open}
                delay={0}
                fadeDuration={200}
                scaleDuration={250}
              >
                <Disclosure.Panel>
                  <div style={{ height: 500, marginTop: 5 }}>
                    {logsSocket ? <SimpleLog url={logsSocket} /> : null}
                  </div>
                </Disclosure.Panel>
              </Collapsible>
            </Card>
          )}
        </Disclosure>

        <Card id="build-history">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
            Build History
          </h2>
          <History historyItems={historyItems} />
        </Card>
      </main>
    </div>
  );
}
