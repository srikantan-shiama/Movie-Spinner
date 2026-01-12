import pandas as pd
import ast

df = pd.read_csv("tmdb_5000_movies.csv")

df = df[df["runtime"].notnull()]

df = df[df["runtime"] > 0]

def parse_genres(genre_str):
    try:
        genres = ast.literal_eval(genre_str)
        return [g["name"] for g in genres]
    except:
        return []

df["genre_list"] = df["genres"].apply(parse_genres)

def time_bucket(r):
    if r < 90:
        return "short"
    if 90 <= r <= 120:
        return "medium"
    return "long"

df["time_bucket"] = df["runtime"].apply(time_bucket)

HIGH = {"Action", "Thriller", "Adventure", "Horror"}
LOW = {"Drama", "Romance", "Documentary"}

def energy_bucket(genres):
    if any(g in HIGH for g in genres):
        return "high"
    if any(g in LOW for g in genres):
        return "low"
    return "medium"

df["energy"] = df["genre_list"].apply(energy_bucket)

print(df.head())

def mood_bucket(genres):
    if "Comedy" in genres or "Family" in genres:
        return "light"
    if "Drama" in genres:
        return "reflective"
    return "intense"

df["mood"] = df["genre_list"].apply(mood_bucket)

print(df.head())

import json

movies = df.to_dict(orient="records")
with open("movies.json", "w") as f:
    json.dump(movies, f)