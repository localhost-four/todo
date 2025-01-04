" SESSION CONFIG
" Disable unnecessary data from session
set sessionoptions-=globals
set sessionoptions-=localoptions
set sessionoptions-=options

" Create Json Config
" Json Config setup for javascript project
" Prefix s: to a function make it private to this plugin
function! s:CreateJsonConfig()
    " Check if the root has package.json file"
    if filereadable('./package.json')
        " Create jsconfig.json on root
        if !(filereadable('./jsconfig.json'))
            " commonJS module import for node and express
            exe '!echo {"compilerOptions": {},"exclude": ["dist"]} > jsconfig.json'
            echo 'Created jsconfig.json at root'
        endif
    endif

    " Create jsconfig.json on frontend
    if isdirectory('./frontend') && filereadable('./frontend/package.json')
        if !(filereadable('./frontend/jsconfig.json'))
            " es2015 module import for reactJS
            exe '!echo {"compilerOptions": {},"exclude": ["dist"]} > ./frontend/jsconfig.json'
            echo 'Created jsconfig.json at frontend'
        endif
    endif
endfunction

" NerdTree Custom Toggle for same NERDTree on every tab
" Prefix s: to a function make it private to this plugin
function! s:NerdTreeCopyToggle()
    if exists('t:NERDTreeBufName') && bufwinnr(t:NERDTreeBufName) != -1
        :NERDTreeToggle
    else
        :NERDTreeMirror
        :NERDTreeFocus
    endif
endfunction

" Create a name for nerdtree session
let g:nerdtreename = split(expand('%:p:h'), '\')[-1]

" Creates a session
function! MakeSession()
    "let b:sessiondir = $HOME
    "let b:sessionfile = b:sessiondir . '/.session.vim'
    let b:sessionfile = './.session.vim'
    exe "mksession! " . b:sessionfile
endfunction

function! SaveSession()
    " Check if the 'ns' in argv
    if g:nosession == 1
        echo "Close with no session"
        return
    endif

    " Updates a session, BUT ONLY IF IT ALREADY EXISTS
    if g:sessiondir != ""
        let b:sessionfile = './.session.vim'

        ":call WatchmanClear()

        if !(filereadable(b:sessionfile))
            "Save NerdTree Session
            :call s:NerdTreeCopyToggle()
            :call g:NERDTreeProject.Add(g:nerdtreename, b:NERDTree)

            "If NERDTree opened close it.
            if exists('t:NERDTreeBufName') && bufwinnr(t:NERDTreeBufName) != -1
                :NERDTreeToggle
            endif
            :call MakeSession()

            echo "Save new session"
        else
            "Save NerdTree Session
            :call s:NerdTreeCopyToggle()
            :call g:NERDTreeProject.Add(g:nerdtreename, b:NERDTree)
            
            "If NERDTree opened close it.
            if exists('t:NERDTreeBufName') && bufwinnr(t:NERDTreeBufName) != -1
                :NERDTreeToggle
            endif
            exe "mksession! " . b:sessionfile

            echo "Updating session"
        endif
    else
        echo "Session Error: Not running on project root dir"
    endif
endfunction


" Loads a session if it exists when staring nvim .
function! LoadSession()
    if argv(1)=='ns'
        let g:nosession = 1
    else
        let g:nosession = 0
    endif

    if argv(0)=='.'
        if argv(1)!='ns'
            :call s:CreateJsonConfig()
            ":call InitFZFCache()
            echo "need to implement"
        endif

        let g:sessiondir = expand('%:p:h')
        let b:sessionfile = './.session.vim'

        if (filereadable(b:sessionfile))
            exe 'source ' b:sessionfile

            "Load NERDTree Session"
            :call g:NERDTreeProject.Open(g:nerdtreename)
            :NERDTreeToggle

            echo "Session loaded"
        else
            echo "No session loaded"
        endif
    else
        echo "Session Disabled: Not running on project root directory"
        let g:sessiondir = ""
        let b:sessionfile = ""
    endif
endfunction

au VimEnter * nested :call LoadSession()
au VimLeave * :call SaveSession()
" SESSION CONFIG END