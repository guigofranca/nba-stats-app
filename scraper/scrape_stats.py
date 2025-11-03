import pandas as pd
import json
import os
import datetime

def scrape_data():
    print("Iniciando scraping de estatísticas da NBA...")
    
    # URL do Basketball-Reference para a temporada 2025-26
    URL = 'https://www.basketball-reference.com/leagues/NBA_2026_per_game.html'
    
    try:
        tables = pd.read_html(URL)
        df = tables[0]
        
        print("Tabela HTML lida com sucesso.")
        
    except Exception as e:
        print(f"Erro ao tentar ler a URL: {e}")
        print("Possível causa: A temporada 2025-26 ainda não começou ou a URL mudou.")
        return

    
    # caso tenha linha duplicada
    df_cleaned = df[df.Player != 'Player']
    # web scraping pega a linha "league average", então aqui retira ela
    df_cleaned = df_cleaned[df_cleaned.Player != 'League Average']
    # caso tenha linha vazia
    df_cleaned = df_cleaned[df_cleaned.Player.notna()]

    # colunas que quero retirar (por jogo)
    column_map = {
        'Player': 'NAME',
        'Pos': 'POS',
        'Team': 'TEAM',
        'G': 'GP',     
        'MP': 'MIN',   
        'PTS': 'PTS',
        'TRB': 'REB',  
        'AST': 'AST',
        'STL': 'STL',
        'BLK': 'BLK',
        'TOV': 'TO'    
    }
    
    df_selected = df_cleaned[list(column_map.keys())]
    
    # renomear as colunas de acordo com o map que fiz acima
    df_final = df_selected.rename(columns=column_map)
    
    # trabalhar com números onde precisa
    stats_cols = ['GP', 'MIN', 'PTS', 'REB', 'AST', 'STL', 'BLK', 'TO']
    df_final[stats_cols] = df_final[stats_cols].apply(pd.to_numeric, errors='coerce')
    
    # caso tenha algum dado sendo not a number, renomear pelo numero 0
    df_final = df_final.fillna(0)

    # timestamp padronizado
    now_utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    df_final['UPDATED_AT'] = now_utc
    
    # converter para json (dicionario)
    data_list = df_final.to_dict('records')

    # salvar arquivo
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, '..', 'frontend', 'public', 'data', 'stats.json')
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(data_list, f, ensure_ascii=False, indent=2)

    print(f"Scraping concluído! {len(data_list)} jogadores salvos em {output_path}")

if __name__ == "__main__":
    scrape_data()
