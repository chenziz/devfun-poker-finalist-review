require "csv"
require "json"

input, output = ARGV
rows = CSV.read(input, headers: true).map(&:to_h)
File.write(output, JSON.pretty_generate(rows) + "\n")
