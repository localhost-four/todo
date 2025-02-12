
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not vim.loop.fs_stat(lazypath) then
  vim.fn.system({
    "git",
    "clone",
    "--filter=blob:none",
    "https://github.com/folke/lazy.nvim.git",
    "--branch=stable", -- latest stable release
    lazypath,
  })
end
vim.opt.rtp:prepend(lazypath)

require('utils')
require('settings')
require('keymaps')

plugin_modules = {
  -- speed up nvim load time
  'impatient',
  'bfq',

  -- icons
  -- 'circles',

  -- appearance
  'devicons',
  -- 'ccc',
  -- 'hexokinase',
  -- 'galaxyline',
  -- 'feline',
  'indent_blankline',

  -- colorschemes
  -- 'nightfox',
  -- 'sonokai',
  -- 'nord',
  -- 'material',
  'tokyo_night',
  -- 'base16',
  -- 'seoul256',
  -- 'github_theme',
  -- 'lighthaus',
  -- 'onedark',
  -- 'zenbones',
  -- 'darkplus',
  -- 'oh_lucy',
  -- 'iceberg',
  -- 'noctis',
  -- 'nordic',
  -- 'caret',
  -- 'sherbet',
  -- 'rose_pine',
  -- 'catppuccin',
  -- 'tundra',
  -- 'kanagawa',
  -- 'flow',
  -- 'darkvoid',
  -- 'neofusion',
  -- 'monokai_pro',
  -- 'codeschool',
  -- 'minimal',
  -- 'no_clown_fiesta',
  'lualine',

  -- syntax
  'treesitter',
  -- 'vim_sleuth',
  'slint',
  'indent_o_matic',

  -- typing
  -- 'nvim_autopairs',
  'visual_multi',
  -- 'comment',
  -- 'nvim_comment',
  'repeat',
  'surround',
  -- 'mini',
  'unimpaired',
  --'ultisnips',
  -- 'snippy',
  'wordmotion',
  'rsi', -- alt / backspace support
  -- 'yoink',
  -- 'yanky',
  'neoclip',
  'wilder',
  'doge',
  'auto_hls',

  -- file navigation
  -- 'nvim_tree',
  'neo_tree',
  -- 'fzf',
  'telescope',

  -- buffer navigation
  'lightspeed',
  -- 'bfq',
  -- 'slash',

  -- help
  'which_key',
  -- 'noice',

  -- language specific
  -- 'package_info', -- package.json helper
  'import_cost', -- js import package sizes
  'glsl',
  'vim_ruby',
  -- 'ts_tools',
  'rust_tools',

  -- lsp
  -- 'coq',
  'trouble',
  'lsp_colors',
  -- 'cmp',
  -- 'navigator',
  'lsp',
  'diagnostic_window',
  'lspsaga',
  'none_ls',
  'nvim_autopairs',
  'cmp',
  'snippy',

  -- linting / testing
  'whitespace',
  'vim_test',
  -- 'conform',
  -- 'lint',
  -- 'neotest',
  -- 'null_ls_config',

  -- fun
  -- 'dashboard',
  'alpha',
  -- 'leetcode',
  -- 'chat_gpt',
  'avante',
  -- 'obsidian',
  -- 'codeium',
  -- 'copilot',

  -- system
  -- 'floaterm',
  'fterm',
  'hologram',
  'undotree',

  -- git
  'gitsigns',
  'fugitive',
  -- 'flog',
  'gv',

  -- debuggers
  'neodev',
  -- 'dap',

  -- project
  -- 'neorg'
}

local plugin_configs = into(function(name)
  return require('plugins/' .. name)
end, plugin_modules)

require('lazy').setup(plugin_configs)