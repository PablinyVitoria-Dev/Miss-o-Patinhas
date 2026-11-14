(() => {
    const $ = (id) => document.getElementById(id);
    const form = $('form');
    const MAX_MB = 5;
    const TIPOS = ['image/jpeg', 'image/png'];
    let fotoDataUrl = '';

    /* ---------- Aviso ---------- */
    let timer;
    const avisar = (msg) => {
        const el = $('aviso');
        el.textContent = msg;
        el.classList.add('mostrar');
        clearTimeout(timer);
        timer = setTimeout(() => el.classList.remove('mostrar'), 3500);
    };

    /* ---------- Erros ---------- */
    const erro = (campo, msg) => {
        const box = $('erro-' + campo);
        if (!box) return;
        box.textContent = msg || '';
        box.closest('.campo').classList.toggle('invalido', !!msg);
    };

    /* ---------- Foto ---------- */
    const upload = $('upload');
    const inputFoto = $('foto');

    function lerFoto(arquivo) {
        erro('foto', '');
        if (!arquivo) return;
        if (!TIPOS.includes(arquivo.type)) return erro('foto', 'Use uma imagem JPG ou PNG.');
        if (arquivo.size > MAX_MB * 1024 * 1024) return erro('foto', `A foto deve ter no máximo ${MAX_MB} MB.`);
        const leitor = new FileReader();
        leitor.onload = () => {
            fotoDataUrl = leitor.result;
            $('previa').src = fotoDataUrl;
            $('previa').hidden = false;
            $('uploadTexto').hidden = true;
        };
        leitor.readAsDataURL(arquivo);
    }

    inputFoto.addEventListener('change', () => lerFoto(inputFoto.files[0]));
    upload.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault();
            inputFoto.click(); }
    });
    ['dragenter', 'dragover'].forEach((ev) =>
        upload.addEventListener(ev, (e) => { e.preventDefault();
            upload.classList.add('arrastando'); }));
    ['dragleave', 'drop'].forEach((ev) =>
        upload.addEventListener(ev, (e) => { e.preventDefault();
            upload.classList.remove('arrastando'); }));
    upload.addEventListener('drop', (e) => lerFoto(e.dataTransfer.files[0]));

    /* ---------- Máscara de telefone: (11) 98765-4321 ---------- */
    $('contato').addEventListener('input', (e) => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 11);
        if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
        else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
        else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
        else if (v.length) v = v.replace(/^(\d{0,2})$/, '($1');
        e.target.value = v;
    });

    /* Data: não permite datas futuras */
    const hoje = new Date().toISOString().split('T')[0];
    $('data').max = hoje;

    /* ---------- Validação ---------- */
    function validar() {
        let ok = true;
        const falha = (c, m) => { erro(c, m);
            ok = false; };
        const v = (id) => $(id).value.trim();

        v('nome').length < 2 ? falha('nome', 'Informe o nome do animal (ou "Sem nome").') : erro('nome');
        v('situacao') ? erro('situacao') : falha('situacao', 'Selecione a situação.');
        v('especie') ? erro('especie') : falha('especie', 'Selecione a espécie.');
        v('caract').length < 10 ? falha('caract', 'Descreva o animal com pelo menos 10 caracteres.') : erro('caract');
        v('regiao').length < 3 ? falha('regiao', 'Informe onde o animal foi visto.') : erro('regiao');
        if (!$('data').value || $('data').type !== 'date') falha('data', 'Selecione a data.');
        else if ($('data').value > hoje) falha('data', 'A data não pode ser no futuro.');
        else erro('data');
        const tel = v('contato').replace(/\D/g, '');
        tel.length < 10 ? falha('contato', 'Informe um telefone com DDD.') : erro('contato');
        if (!fotoDataUrl) falha('foto', 'Adicione uma foto do animal.');
        return ok;
    }

    /* ---------- Publicar ---------- */
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!validar()) {
            avisar('Revise os campos destacados.');
            const primeiro = document.querySelector('.invalido');
            primeiro && primeiro.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }

        const animal = {
            id: Date.now(),
            foto: fotoDataUrl,
            nome: $('nome').value.trim(),
            situacao: $('situacao').value,
            especie: $('especie').value,
            caracteristicas: $('caract').value.trim(),
            regiao: $('regiao').value.trim(),
            data: $('data').value,
            contato: $('contato').value,
        };

        try {
            const lista = JSON.parse(localStorage.getItem('animais') || '[]');
            lista.unshift(animal);
            localStorage.setItem('animais', JSON.stringify(lista));
        } catch (_) {
            return avisar('Não foi possível salvar. Tente uma foto menor.');
        }

        avisar(`${animal.nome} foi publicado!`);
        form.reset();
        fotoDataUrl = '';
        $('previa').hidden = true;
        $('uploadTexto').hidden = false;
        $('data').type = 'text';
    });

    /* Limpa o erro ao digitar */
    form.addEventListener('input', (e) => e.target.id && erro(e.target.id));
})();