import pandas as pd

input_filename = 'registrations_proper_format.csv'

events_map = {
    'HACKATHON': 'idea-force-data.csv',
    'PROPRES': 'propers-data.csv',
    'VISIONX': 'visionx-data.csv',
    'FREEZEFRAME': 'freezeframe-data.csv',
    'SHORTFLIX': 'shortflix-data.csv'
}

try:
    df = pd.read_csv(input_filename)

    # Clean the Event names for matching
    df['Clean_Event'] = df['Event'].str.replace(r'\s*\(.*\)', '', regex=True).str.strip()

    for original_event, output_filename in events_map.items():
        search_term = original_event.split('(')[0].strip()
        event_df = df[df['Clean_Event'].str.lower() == search_term.lower()].copy()

        if not event_df.empty:
            # Group by 'Reg ID' to assign a Team Number
            unique_reg_ids = event_df['Reg ID'].unique()
            team_num_map = {reg_id: f"{i + 1:03d}" for i, reg_id in enumerate(unique_reg_ids)}

            event_df['number'] = event_df['Reg ID'].map(team_num_map)

            # --- UPDATED: Added 'Team Name' to selection ---
            new_df = event_df[['number', 'Name', 'Clean_Event', 'Team Name']].copy()
            new_df.columns = ['number', 'name', 'event', 'team_name']

            # Formatting
            new_df['name'] = new_df['name'].str.title()
            new_df['event'] = new_df['event'].str.upper()
            new_df['team_name'] = new_df['team_name'].str.title() # Make Team Name Title Case

            # Save the event-specific CSV
            new_df.to_csv(output_filename, index=False)
            print(f"Success! {output_filename} created with {len(unique_reg_ids)} teams.")

except FileNotFoundError:
    print(f"Error: Could not find '{input_filename}'.")
except Exception as e:
    print(f"An error occurred: {e}")