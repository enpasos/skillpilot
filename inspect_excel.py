import pandas as pd
import sys

file_path = "curricula/EU/CEFR/CEFR Descriptors (2020).xlsx"

try:
    xl = pd.ExcelFile(file_path)
    with open("excel_columns.txt", "w") as f:
        f.write("Sheet names: " + str(xl.sheet_names) + "\n")
        for sheet in xl.sheet_names:
            df = pd.read_excel(file_path, sheet_name=sheet)
            f.write(f"\n--- Sheet: {sheet} ---\n")
            f.write("Columns: " + str(df.columns.tolist()) + "\n")
            f.write("First row:\n")
            f.write(df.head(1).to_string())
            f.write("\n")
    print("Done writing to excel_columns.txt")
except Exception as e:
    print(f"Error: {e}")
