export interface Recipe {
  id: string;
  id_usuarios: string;
  id_categorias: string;
  nome: string;
  tempo_preparo_minutos: number | null;
  porcoes: number | null;
  modo_preparo: string;
  ingredientes: string | null;
  criado_em: Date;
  alterado_em: Date;
}
