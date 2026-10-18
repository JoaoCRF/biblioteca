const SUPABASE_URL = "https://vzjvqsdncwzfmfnqyuqa.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_IY1rNpaP2Q40zD6ZgqfLHQ_CXRhgifJ";

const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    carregarLivros();
    carregarUsuarios();
    carregarEmprestimos();
});

const formLivro = document.getElementById("form-livro");
formLivro.addEventListener("submit", async (e) => {
    e.preventDefault();
    const titulo = document.getElementById("titulo-livro").value;
    const autor = document.getElementById("autor-livro").value;
    const ano = parseInt(document.getElementById("ano-livro").value);

    const { error } = await supabaseClient.from("livros").insert([{ titulo, autor, ano, disponivel: true }]);
    
    if (error) {
        alert("Erro ao cadastrar livro: " + error.message);
    } else {
        formLivro.reset();
        carregarLivros();
    }
});

async function carregarLivros() {
    const lista = document.getElementById("lista-livros");
    const selectLivro = document.getElementById("select-livro");
    lista.innerHTML = "";
    selectLivro.innerHTML = '<option value="">Selecione o Livro Disponível</option>';

    const { data: livros, error } = await supabaseClient.from("livros").select("*");
    if (error) return console.error(error);

    livros.forEach(l => {
        const li = document.createElement("li");
        li.innerHTML = `${l.titulo} - ${l.autor} (${l.ano}) [${l.disponivel ? 'Disponível' : 'Emprestado'}] 
                        <button onclick="excluirLivro(${l.id})">Excluir</button>`;
        lista.appendChild(li);

        if (l.disponivel) {
            const option = document.createElement("option");
            option.value = l.id;
            option.textContent = l.titulo;
            selectLivro.appendChild(option);
        }
    });
}

async function excluirLivro(id) {
    const { error } = await supabaseClient.from("livros").delete().eq("id", id);
    if (error) alert("Erro ao excluir: " + error.message);
    else carregarLivros();
}

const formUsuario = document.getElementById("form-usuario");
formUsuario.addEventListener("submit", async (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome-usuario").value;
    const email = document.getElementById("email-usuario").value;

    const { error } = await supabaseClient.from("usuarios").insert([{ nome, email }]);
    if (error) {
        alert("Erro ao cadastrar usuário: " + error.message);
    } else {
        formUsuario.reset();
        carregarUsuarios();
    }
});

async function carregarUsuarios() {
    const lista = document.getElementById("lista-usuarios");
    const selectUsuario = document.getElementById("select-usuario");
    lista.innerHTML = "";
    selectUsuario.innerHTML = '<option value="">Selecione o Usuário</option>';

    const { data: usuarios, error } = await supabaseClient.from("usuarios").select("*");
    if (error) return console.error(error);

    usuarios.forEach(u => {
        const li = document.createElement("li");
        li.innerHTML = `${u.nome} (${u.email}) <button onclick="excluirUsuario(${u.id})">Excluir</button>`;
        lista.appendChild(li);

        const option = document.createElement("option");
        option.value = u.id;
        option.textContent = u.nome;
        selectUsuario.appendChild(option);
    });
}

async function excluirUsuario(id) {
    const { error } = await supabaseClient.from("usuarios").delete().eq("id", id);
    if (error) alert("Erro ao excluir: " + error.message);
    else carregarUsuarios();
}

const formEmprestimo = document.getElementById("form-emprestimo");
formEmprestimo.addEventListener("submit", async (e) => {
    e.preventDefault();
    const livro_id = document.getElementById("select-livro").value;
    const usuario_id = document.getElementById("select-usuario").value;

    const { error: errEmp } = await supabaseClient.from("emprestimos").insert([{ livro_id, usuario_id, devolvido: false }]);
    if (errEmp) {
        alert("Erro ao registrar empréstimo: " + errEmp.message);
        return;
    }

    const { error: errLivro } = await supabaseClient.from("livros").update({ disponivel: false }).eq("id", livro_id);
    if (errLivro) {
        alert("Erro ao atualizar status do livro: " + errLivro.message);
    } else {
        formEmprestimo.reset();
        carregarLivros();
        carregarEmprestimos();
    }
});

async function carregarEmprestimos() {
    const lista = document.getElementById("lista-emprestimos");
    lista.innerHTML = "";

    const { data: emprestimos, error } = await supabaseClient
        .from("emprestimos")
        .select(`
            id,
            devolvido,
            data_emprestimo,
            livros (titulo),
            usuarios (nome)
        `)
        .eq("devolvido", false);

    if (error) return console.error(error);

    emprestimos.forEach(e => {
        const li = document.createElement("li");
        li.innerHTML = `Livro: <strong>${e.livros?.titulo}</strong> | Usuário: <strong>${e.usuarios?.nome}</strong> (Data: ${e.data_emprestimo})
                        <button onclick="registrarDevolucao(${e.id}, ${e.livros})">Devolver</button>`;
        lista.appendChild(li);
    });
}

async function registrarDevolucao(emprestimoId, livroId) {
    await supabaseClient.from("emprestimos").update({ devolvido: true, data_devolucao: new Date().toISOString() }).eq("id", emprestimoId);
    
    location.reload(); 
}

function openTab(tabName) {
    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(content => content.classList.remove("active"));

    const buttons = document.querySelectorAll(".tab-btn");
    buttons.forEach(btn => btn.classList.remove("active"));

    document.getElementById(`tab-${tabName}`).classList.add("active");
    event.currentTarget.classList.add("active");
}