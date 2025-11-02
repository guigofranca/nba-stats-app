import pandas as pd
import json
import os
import datetime

def scrape_data():
    print("Iniciando scraping de estatísticas da NBA...")
    
    # URL do Basketball-Reference para a temporada 2025-26
    # (Usando 2026 como o ano final da temporada)
    URL = 'https://www.basketball-reference.com/leagues/NBA_2026_per_game.html'
    
    # 1. FAZER O SCRAPING DA TABELA
    try:
        tables = pd.read_html(URL)
        df = tables[0]
        
        print("Tabela HTML lida com sucesso.")
        
    except Exception as e:
        print(f"Erro ao tentar ler a URL: {e}")
        print("Possível causa: A temporada 2025-26 ainda não começou ou a URL mudou.")
        return

    # 2. LIMPAR OS DADOS (COM A SUA CORREÇÃO)
    
    # Passo 2a: Remove linhas de cabeçalho duplicadas (onde 'Player' == 'Player')
    df_cleaned = df[df.Player != 'Player']
    
    # --- INÍCIO DA NOVA CORREÇÃO ---
    # Passo 2b: Remove a linha "League Average" que você identificou
    df_cleaned = df_cleaned[df_cleaned.Player != 'League Average']
    
    # Passo 2c: Remove quaisquer linhas que possam estar totalmente vazias (sem nome de jogador)
    # Isso garante que apenas jogadores reais sejam processados
    df_cleaned = df_cleaned[df_cleaned.Player.notna()]
    # --- FIM DA NOVA CORREÇÃO ---
    
    
    # 3. SELECIONAR AS COLUNAS QUE QUEREMOS
    column_map = {
        'Player': 'NAME',
        'Pos': 'POS',
        'Team': 'TEAM',
        'G': 'GP',      # Games Played
        'MP': 'MIN',    # Minutes Per Game
        'PTS': 'PTS',
        'TRB': 'REB',   # Total Rebounds
        'AST': 'AST',
        'STL': 'STL',
        'BLK': 'BLK',
        'TOV': 'TO'     # Turnovers
    }
    
    # Pega apenas as colunas que estão no nosso mapa
    df_selected = df_cleaned[list(column_map.keys())]
    
    # Renomeia as colunas
    df_final = df_selected.rename(columns=column_map)
    
    # 4. CONVERTER DADOS E LIDAR COM VALORES AUSENTES
    # Converte colunas de estatísticas para número
    stats_cols = ['GP', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TO']
    df_final[stats_cols] = df_final[stats_cols].apply(pd.to_numeric, errors='coerce')
    
    # Substitui qualquer valor "NaN" (Not a Number) por 0
    df_final = df_final.fillna(0)

    # 5. ADICIONAR TIMESTAMP (CARIMBO DE DATA/HORA)
    # Usamos UTC para um padrão consistente no servidor
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    df_final['UPDATED_AT'] = now_utc
    
    # 6. CONVERTER PARA O FORMATO JSON (LISTA DE DICIONÁRIOS)
    data_list = df_final.to_dict('records')

    # 7. SALVAR O ARQUIVO JSON NO LOCAL CORRETO
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, '..', 'frontend', 'public', 'data', 'stats.json')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=2)

    print(f"Scraping concluído! {len(data_list)} jogadores salvos em {output_path}")

if __name__ == "__main__":
    scrape_data()