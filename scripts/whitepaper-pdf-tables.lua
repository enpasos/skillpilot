-- GFM pipe tables have no column widths. For PDF output, give them equal
-- relative widths so Pandoc wraps cell contents instead of overflowing the page.
-- Explicitly authored widths and HTML/Markdown output remain unchanged.
function Table(tbl)
  if FORMAT ~= 'latex' then
    return nil
  end

  -- Pandoc 2.10+ uses colspecs; 2.9 uses the legacy widths list.
  local columns = tbl.colspecs or tbl.widths
  if not columns or #columns == 0 then
    return nil
  end
  for _, column in ipairs(columns) do
    local width = tbl.colspecs and column[2] or column
    if width ~= 0 then
      return nil
    end
  end

  for index, column in ipairs(columns) do
    if tbl.colspecs then
      column[2] = 1 / #columns
    else
      tbl.widths[index] = 1 / #columns
    end
  end
  if tbl.colspecs then
    tbl.colspecs = columns
  end
  return tbl
end
