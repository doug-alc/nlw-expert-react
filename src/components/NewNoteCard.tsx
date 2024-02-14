import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

//definindo as propriedades e métodos da função onNoteCreated 
//que recebe o parâmetro content com retorno vazio
interface NewNoteCardProps {
  onNoteCreated: (content: string) => void 
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnBoarding, setShouldShowOnBoarding] = useState(true)    //estado do editor de texto
  const [content, setContent] = useState('')                                //estado do conteúdo
  const [isRecording, setIsRecording] = useState(false)                     //estado da gravação

  //função que abre o editor de texto
  function handleStartEditor() {                
    setShouldShowOnBoarding(false)
  }

  //função que verifica o conteúdo do editor de texto
  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {  
    setContent(event.target.value)
    if(event.target.value == '') {
      setShouldShowOnBoarding(true)
    }   
  }

  //função que salva o conteúdo do editor de texto
  function handleSaveNote(event: FormEvent) {      
    event.preventDefault()                      //não permite o fechamento padrão do formulário

    if(content == '') return                    //não permite salvar uma nota vazia

    onNoteCreated(content)                      //executa a função que salva nova nota
    toast.success('Nota criada com sucesso!')
    setContent('')                              //limpa o conteúdo após salvar a nota
    setShouldShowOnBoarding(true)               //retorna o card para a tela inicial
  }

  function handleStartRecording() {

    //verifica se o browser suporta o reconhecimento de voz
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIAvailable) {
      alert('Infelizmente o seu navegador não suporta a API de gravação!')
      return
    }

    setIsRecording(true) 
    setShouldShowOnBoarding(false)


    //cria uma instância do objeto 'speechrecognition'
    speechRecognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)()  

    //configura o reconhecimento de voz
    speechRecognition.lang = 'pt-BR'           //idioma
    speechRecognition.continuous = true        //não interrompe a gravação
    speechRecognition.maxAlternatives = 1      //retorna apenas uma opção de palavra durante o reconhecimento
    speechRecognition.interimResults = true    //retorna os resultados provisórios durante o reconhecimento

    //
    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)
      }, '')
      setContent(transcription)
    }

    speechRecognition.onerror = (event) => {
      console.error(event);
    }

    speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if(speechRecognition != null) {
      speechRecognition.stop()
    }
  }

    return (
      <Dialog.Root>
        <Dialog.Trigger 
        className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 outline-none 
        hover:ring-2 hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
          <span className="text-sm font-medium text-slate-200">
            Adicionar nota
          </span>
          
          <p className="text-sm leading-6 text-slate-400">
            Grave uma nota em áudio que será convertida para texto automaticamente.
          </p>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
          <Dialog.Content 
            className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] 
            flex flex-col md:rounded-md bg-slate-700 outline-none'>
            
            <Dialog.Close className='absolute right-0 tp-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100 outline-none'>
              <X className='size-5' />
            </Dialog.Close>

            <form className=' flex-1 flex flex-col'>
              <div className='flex flex-1 flex-col gap-3 p-5'>
                <span className="text-sm font-medium text-slate-300">
                  Adicionar nota
                </span>
            
                {shouldShowOnBoarding ? (
                  <p className="text-sm leading-6 text-slate-400">
                    Comece <button type='button' onClick={handleStartRecording} className='font-medium text-lime-400 hover:underline'>gravando uma nota de áudio</button> ou se preferir utilize <button type='button' onClick={handleStartEditor} className='font-medium text-lime-400 hover:underline'> apenas texto.</button>
                  </p>) : (
                    <textarea 
                    autoFocus 
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                    onChange={handleContentChanged}
                    value={content}      
                    />
                  )
                }
              </div>

              {isRecording ? (
                  <button 
                    type="button"
                    className='w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:text-slate-100'
                    onClick={handleStopRecording}
                    >
                      <div className='size-3 rounded-full bg-red-500 animate-pulse'/>
                      Gravando (clique p/ interromper)
                  </button>
                ) : (
                  <button 
                  type="button"
                  className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
                  onClick={handleSaveNote}
                  >
                    Salvar nota
                  </button>
                )}

            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    )
}