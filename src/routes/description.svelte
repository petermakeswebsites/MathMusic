<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog"
  import Code from "$lib/components/ui/code.svelte"
  import { ScrollArea } from "$lib/components/ui/scroll-area"
  import { GlobalMathList } from "$lib/function-maker"
  import * as Table from "$lib/components/ui/table"
  let {
    guideOpen = $bindable(),
    playing = $bindable(),
  }: { guideOpen: boolean; playing: boolean } = $props()
</script>

<p class="text-sm text-muted-foreground mb-4">
  Use the
  <Code>slider</Code>
  variable in your script.
  <a
    href="#"
    onclick={(e) => {
      e.preventDefault
      guideOpen = true
    }}
    class="font-medium text-primary underline underline-offset-4"
  >
    Find out more.
  </a>
  <Dialog.Root bind:open={guideOpen}>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>User Guide</Dialog.Title>
        <Dialog.Description>
          Write a function in javascript using <Code>t</Code> representing the time
          in seconds elapsed and <Code>slider</Code> representing the value of the
          slider from <Code>0</Code> to <Code>1</Code>. To superimpose multiple
          formulas, you can add with <Code>+</Code> or create a new line. There is
          also a special <Code>sum</Code> function:
        </Dialog.Description>
        <Dialog.Description>
          <center class="my-4">
            <Code>sum(1,10,n => sin(n*x*pi*440)/n)</Code> <br />
            <span class="text-xs text-muted-foreground"
              >Sum from 1 to 10 to make a sawtooth sound at 440hz - <a
                href="#%7B%22fn%22%3A%22sum(1%2C10%2Cn%20%3D%3E%20sin(n*t*pi*440)%2Fn)%22%7D"
                onclick={() => {
                  guideOpen = false
                  playing = true
                }}
                class="font-medium text-primary underline underline-offset-4"
              >
                try it
              </a>.</span
            >
          </center>
        </Dialog.Description>
        <Dialog.Description>
          <ScrollArea class="h-[300px] mt-2 w-full rounded-md border p-0">
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="w-[200px]">Name</Table.Head>
                  <Table.Head>Example</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each Object.entries(GlobalMathList) as [code, { name, ex }]}
                  <Table.Row>
                    <Table.Cell class="font-medium">{name}</Table.Cell>
                    <Table.Cell>
                      <Code>
                        {ex}
                      </Code>
                    </Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          </ScrollArea>
        </Dialog.Description>
        <Dialog.Footer></Dialog.Footer>
      </Dialog.Header>
    </Dialog.Content>
  </Dialog.Root>
</p>
