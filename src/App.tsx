import { ChangeEvent, useState } from "react";
import logo from "./assets/logo-nlw-expert.svg"
import { NewNoteCard } from "./components/NewNoteCard"
import { NoteCard } from "./components/NoteCard"
import { toast } from "sonner";

//definindo as propriedades e métodos do estado 'notes'
interface Notes {
  id: string 
  date: Date 
  content: string
}

export function App() {
  //estado de pesquisa das notas
  const [search, setSearch] = useState('')

  //estado das notas
  const [notes, setNotes] = useState<Notes[]>(() => {
    const notesOnStorage = localStorage.getItem('notes')          //busca no local storage se há notas
    if(notesOnStorage) {                                          //caso exista, retorna o array
      return JSON.parse(notesOnStorage)
    } return []
  })

  //campo de pesquisa das notas
  const filteredNotes = (search != '' ? notes.filter(note => note.content.toLowerCase().includes(search.toLowerCase())) : notes)

  //função para pesquisar as notas
  function handleSearch(event: ChangeEvent<HTMLInputElement>) {
    const query = event.target.value
    setSearch(query)
  }

  //função para criar nova nota
  function onNoteCreated(content: string) {
    //definindo as propriedades das novas notas
    const newNote = {
      id: crypto.randomUUID(),
      date: new Date(), 
      content,
    }
    const notesArray = [newNote, ...notes]  //copia todas as notas e adiciona uma nova nota
    setNotes(notesArray) 
    localStorage.setItem('notes', JSON.stringify(notesArray)) //enviando as informações para o local storage
  }

  //função para apagar as notas
  function onNoteDeleted(id: string) {
    const notesArray = notes.filter(note => {
      return note.id != id
    })
  
    setNotes(notesArray)

    localStorage.setItem('notes', JSON.stringify(notesArray)) //enviando as informações para o local storage

    toast.error('Nota apagada!')
  }

  return (
    <div className="mx-auto max-w-6xl my-12 space-y-6 px-5">
      
      {/* imagem do logotipo */}
      <img src={logo} alt="NLW Expert" />

      {/* input de pesquisa das notas */}
      <form className="w-full">
        <input 
          type="text" 
          placeholder="Busque suas notas..." 
          className="w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-slate-500"
          onChange={handleSearch}
          />
      </form>

      {/* separador */}
      <div className="h-px bg-slate-700"/>
    
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[250px]">
        {/* cria nova nota */}
        <NewNoteCard onNoteCreated={onNoteCreated} /> 

        {/* renderiza todas as notas */}
        {filteredNotes.map(note => <NoteCard key={note.id} note={note} onNoteDeleted={onNoteDeleted} />)}
      </div>    
    </div>
  );
}
